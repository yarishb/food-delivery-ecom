// apps/ai-service/src/app.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('ai')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('test')
  async testRoute(@Body() body: { message: string }) {
    const reply = await this.appService.testAi(body.message);
    return { success: true, reply };
  }
}
