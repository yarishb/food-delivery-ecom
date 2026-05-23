import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { ChatHistoryService } from './chat-history/chat-history.service';

@Controller('ai')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  @Post('process-command')
  @HttpCode(200)
  async processCommand(@Body() body: { message: string; sessionId?: string }) {
    const reply = await this.appService.processCopilotCommand(
      body.message,
      body.sessionId,
    );
    return { success: true, reply };
  }

  @Post('chat/stream')
  async streamChat(
    @Body() body: { message: string; sessionId?: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      await this.appService.streamCopilotCommand(
        body.message,
        body.sessionId || 'default',
        (token) => {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        },
      );
      res.write('data: [DONE]\n\n');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    }

    res.end();
  }

  @Get('health')
  async health() {
    const db = await this.chatHistoryService.checkHealth();
    return { status: db.ok ? 'ok' : 'error', db };
  }

  @Get('sessions')
  async getSessions() {
    const sessions = await this.chatHistoryService.getSessions();
    return { success: true, sessions };
  }

  @Get('sessions/:id/messages')
  async getSessionMessages(@Param('id') id: string) {
    const messages = await this.chatHistoryService.getSessionMessages(id);
    return { success: true, messages };
  }

  @Delete('sessions/:id')
  @HttpCode(200)
  async deleteSession(@Param('id') id: string) {
    await this.chatHistoryService.deleteSession(id);
    return { success: true };
  }
}
