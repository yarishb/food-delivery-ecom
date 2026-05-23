import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export type ChatSession = {
  id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: number;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

@Injectable()
export class ChatHistoryService {
  private readonly logger = new Logger(ChatHistoryService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async persist(
    sessionId: string,
    userMessage: string,
    assistantResponse: string,
    isNewSession: boolean,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const title = isNewSession
      ? userMessage.length > 80
        ? userMessage.slice(0, 80) + '…'
        : userMessage
      : undefined;

    const { error: sessionError } = await supabase.from('chat_sessions').upsert(
      {
        id: sessionId,
        updated_at: new Date().toISOString(),
        ...(title ? { title } : {}),
      },
      { onConflict: 'id' },
    );

    if (sessionError) {
      this.logger.error(
        `[ChatHistory] Failed to upsert session "${sessionId}": ${sessionError.message}`,
        sessionError,
      );
      return; // Don't insert messages if the parent row failed
    }

    const { error: msgError } = await supabase.from('chat_messages').insert([
      { session_id: sessionId, role: 'user', content: userMessage },
      { session_id: sessionId, role: 'assistant', content: assistantResponse },
    ]);

    if (msgError) {
      this.logger.error(
        `[ChatHistory] Failed to insert messages for session "${sessionId}": ${msgError.message}`,
        msgError,
      );
    } else {
      this.logger.log(
        `[ChatHistory] Saved exchange for session "${sessionId}"`,
      );
    }
  }

  async checkHealth(): Promise<{ ok: boolean; error?: string }> {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .from('chat_sessions')
        .select('id')
        .limit(1);

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getSessions(): Promise<ChatSession[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('chat_sessions')
      .select(
        `
        id,
        title,
        created_at,
        updated_at,
        message_count:chat_messages(count)
      `,
      )
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) {
      this.logger.error('[ChatHistory] getSessions failed', error.message);
      return [];
    }

    return (data ?? []).map((s: any) => ({
      ...s,
      message_count: s.message_count?.[0]?.count ?? 0,
    }));
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error(
        '[ChatHistory] getSessionMessages failed',
        error.message,
      );
      return [];
    }

    return data ?? [];
  }

  async deleteSession(sessionId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      this.logger.error('[ChatHistory] deleteSession failed', error.message);
      throw new Error(error.message);
    }
  }
}
