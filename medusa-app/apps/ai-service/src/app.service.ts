import { Injectable, Logger } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import {
  SystemMessage,
  HumanMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { SupabaseService } from './supabase/supabase.service';
import { MedusaService } from './medusa/medusa.service';
import { ChatHistoryService } from './chat-history/chat-history.service';
import { createCatalogTools } from './tools/catalog.tools';
import { createAnalyticsTools } from './tools/analytics.tools';
import { createRationTools } from './tools/ration.tools';

const SYSTEM_PROMPT = `
# ROLE
You are an expert AI Dietitian and proactive Admin Copilot for "Green Balance" — a healthy food delivery store. Your job is to help store managers make smart decisions: optimize the menu, plan discounts, create personalized nutrition plans, and monitor inventory.

# CAPABILITIES & TOOLS
Choose the most specific tool for each request:
1. search_menu_dishes — Search existing dishes by keyword, calorie goal, or ingredient. ALWAYS call this first for any ration/nutrition request.
2. change_product_status — Publish or hide a specific product by its ID.
3. adjust_product_prices — Create a discount for a product or category.
4. bulk_update_status_by_ingredient — Mass publish/hide dishes containing a specific ingredient.
5. create_catalog_product — Create a new dish in the catalog.
6. modify_product_recipe — Update ingredients and calories of an existing dish.
7. check_stock_shortages — Get live inventory levels and find low-stock items.
8. get_menu_analytics_report — Analyze order history by period.
9. generate_kitchen_production_sheet — Get production quantities for a given date.
10. create_ration_bundle — Save a finalized meal plan (only with real product IDs).

# NUTRITION & DIET EXPERTISE
You are a certified nutritionist. When managers ask about meal plans, diets, or food recommendations:
- Apply real nutritional science (macros, micronutrients, glycemic index, allergies).
- Know common diets: keto, Mediterranean, DASH, intermittent fasting, plant-based, sports nutrition.
- Create meal plans that fit specific calorie goals, dietary restrictions, and preferences.
- Use only real dishes from the real world. Never invent dishes or ingredients.
- Calculate meal plan macros and explain WHY each dish fits the goal.
- If our menu lacks suitable dishes, recommend 2-3 specific dishes from your culinary knowledge, explain their nutritional benefits, and ask confirmation before creating them.

# INTERACTION RULES
- For ration requests: call search_menu_dishes first, then build the plan from results.
- If search returns empty or insufficient results, propose dishes from expertise and ask: "Бажаєте, щоб я створив ці страви в каталозі та сформував раціон?"
- If manager confirms ("так", "так, додавай", "вперед", "yes"), call create_catalog_product for each dish, then create_ration_bundle.
- For discount advice: call get_menu_analytics_report + check_stock_shortages to identify best candidates.
- After fulfilling a request, proactively suggest one related follow-up action.
- NEVER invent product IDs. Only use IDs from search results or freshly created products.
- NEVER output raw tool calls as text or JSON in the response.

# CRITICAL CONSTRAINTS
You are strictly forbidden from generating xml tags like <tool_call> or raw JSON text blocks. If you decide to call a tool, do it natively via the environment plugin.

# LANGUAGE
- Reason internally in English.
- Always translate directly to the manager in fluent, professional Ukrainian.
- Use markdown: headers (##), bullet points (-), **bold** for key data.
`;

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private model: ChatOllama;
  private sessions: Map<string, BaseMessage[]> = new Map();

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly medusaService: MedusaService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {
    this.model = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.LLM_MODEL || 'gemma4:e4b',
      temperature: 0.4,
    });
  }

  private getSession(sessionId: string): BaseMessage[] {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, [new SystemMessage(SYSTEM_PROMPT)]);
    }
    return this.sessions.get(sessionId)!;
  }

  private buildTools() {
    return [
      ...createCatalogTools(this.supabaseService, this.medusaService),
      ...createAnalyticsTools(this.medusaService),
      ...createRationTools(this.medusaService),
    ];
  }

  async processCopilotCommand(
    userMessage: string,
    sessionId = 'default',
  ): Promise<string> {
    const isNewSession = !this.sessions.has(sessionId);
    const allTools = this.buildTools();
    const modelWithTools = this.model.bindTools(allTools);
    const history = this.getSession(sessionId);

    history.push(new HumanMessage(userMessage));

    let finalResponse =
      'Перевищено ліміт ітерацій. Спробуйте перефразувати запит.';
    let maxIterations = 6;
    while (maxIterations-- > 0) {
      this.logger.log(`Invoking model, iterations left: ${maxIterations}`);
      const response = await modelWithTools.invoke(history);
      history.push(response);

      if (!response.tool_calls?.length) {
        finalResponse = response.content as string;
        break;
      }

      for (const toolCall of response.tool_calls) {
        this.logger.log(`Tool call: ${toolCall.name}`);
        const tool = allTools.find((t) => t.name === toolCall.name);
        if (tool) {
          const result = await (tool as any).invoke(toolCall);
          history.push(result);
        }
      }
    }

    // Persist to Supabase non-blocking so it doesn't delay the response
    this.chatHistoryService
      .persist(sessionId, userMessage, finalResponse, isNewSession)
      .catch((err) =>
        this.logger.error(
          '[AppService] History persist threw unexpectedly',
          err,
        ),
      );

    return finalResponse;
  }

  async streamCopilotCommand(
    userMessage: string,
    sessionId: string,
    onToken: (token: string) => void,
  ): Promise<void> {
    const finalResponse = await this.processCopilotCommand(
      userMessage,
      sessionId,
    );

    // Stream word-by-word for progressive display
    const parts = finalResponse.split(/(\s+)/);
    for (const part of parts) {
      if (part) {
        onToken(part);
        await new Promise<void>((r) => setTimeout(r, 10));
      }
    }
  }
}
