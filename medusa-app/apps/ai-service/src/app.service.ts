// apps/ai-service/src/app.service.ts
import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class AppService {
  private model: ChatOllama;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1:8b',
      temperature: 0.3,
      numCtx: 8192,
    });
  }

  async testAi(userMessage: string): Promise<string> {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        "You are an expert nutritionist and customer service manager for 'Green Balance' healthy food delivery. " +
          'Your task is to provide realistic, professional, and healthy meal recommendations. ' +
          'CRITICAL RULE: You must reason in English internally but output the final response ONLY in flawless, natural, grammatically correct Ukrainian. Not direct translation, but thorough thinking.' +
          'Avoid literal translations or weird food combinations. Keep your answer structured and concise.',
      ],
      ['user', '{input}'],
    ]);

    const chain = promptTemplate.pipe(this.model);

    const response = await chain.invoke({
      input: userMessage,
    });

    return response.content as string;
  }
}
