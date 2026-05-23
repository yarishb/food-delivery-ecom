import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';
import { MedusaService } from './medusa/medusa.service';
import { ChatHistoryService } from './chat-history/chat-history.service';
import { MedusaController } from './medusa/medusa.controller';
import { EmbeddingService } from './embedding/embedding.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })],
  controllers: [AppController, MedusaController],
  providers: [
    AppService,
    SupabaseService,
    MedusaService,
    ChatHistoryService,
    EmbeddingService,
  ],
})
export class AppModule {}
