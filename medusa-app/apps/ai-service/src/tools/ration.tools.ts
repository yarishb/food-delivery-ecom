import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MedusaService } from '../medusa/medusa.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EmbeddingService } from '../embedding/embedding.service';

export const createRationTools = (
  supabaseService: SupabaseService,
  embeddingService: EmbeddingService,
  medusaService: MedusaService,
) => {
  const searchMenuTool = tool(
    async ({ query, maxCalories, minCalories }) => {
      try {
        console.log(`[RAG] Семантичний пошук страв за запитом: "${query}"`);

        // 1. Отримуємо актуальний каталог страв із Медузи
        const products = await medusaService.getProducts();

        // 2. Генеруємо вектор для текстового запиту користувача через локальний Ollama (nomic-embed-text)
        const queryVector = await embeddingService.getEmbedding768(query);

        // 3. Звертаємось до Supabase RPC (match_documents) для пошуку релевантних ID продуктів
        const matchedProductIds =
          await supabaseService.searchProductIdsSemantic(queryVector, 10);

        console.log(
          `[RAG] Знайдено релевантних ID у векторній БД:`,
          matchedProductIds,
        );

        // 4. Складаємо список страв, зберігаючи точний порядок релевантності від векторного пошуку
        const matched = matchedProductIds
          .map((id) => products.find((p: any) => p.id === id))
          .filter(Boolean); // видаляємо undefined, якщо якийсь продукт видалили з каталогу, але не з векторів

        // 5. Форматуємо дані та застосовуємо додаткові жорсткі фільтри (калорії)
        const results = matched
          .map((p: any) => {
            const calorieMatch = p.subtitle?.match(/(\d+)\s*ккал/i);
            const calories = calorieMatch ? parseInt(calorieMatch[1]) : null;

            const priceAmount = p.variants?.[0]?.prices?.[0]?.amount;
            const price = priceAmount ? Math.round(priceAmount / 100) : null;

            return {
              id: p.id,
              title: p.title,
              description: p.description ?? '',
              calories,
              price,
              status: p.status,
            };
          })
          .filter((p: any) => {
            if (maxCalories && p.calories && p.calories > maxCalories)
              return false;
            if (minCalories && p.calories && p.calories < minCalories)
              return false;
            return true;
          });

        if (!results.length) {
          return JSON.stringify({
            message:
              'Підходящих страв у каталозі не знайдено за цим контекстом. Можу запропонувати варіанти зі своїх знань.',
            dishes: [],
          });
        }

        return JSON.stringify({ dishes: results });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return JSON.stringify({ error: msg, dishes: [] });
      }
    },
    {
      name: 'search_menu_dishes',
      description:
        'Search published dishes in the real Medusa product catalog semantically using vector database by context, calorie range, or ingredients. Always call this first before building any meal plan.',
      schema: z.object({
        query: z
          .string()
          .describe(
            'Conversational query or keywords to search for, e.g. "низьковуглеводна вечеря", "щось кокосове", "високобілковий обід", "салат без томатів"',
          ),
        maxCalories: z
          .number()
          .optional()
          .describe('Maximum calories per dish (optional filter)'),
        minCalories: z
          .number()
          .optional()
          .describe('Minimum calories per dish (optional filter)'),
      }),
    },
  );

  const createRationBundleTool = tool(
    async ({ name, productIds, totalCalories, description }) => {
      if (!productIds?.length) {
        return 'Помилка: потрібен хоча б один ID продукту для створення раціону.';
      }
      return `Успішно. Раціон "${name}" (${totalCalories} ккал/день) збережено з ${productIds.length} стравами${description ? `: ${description}` : ''}. IDs: ${productIds.join(', ')}.`;
    },
    {
      name: 'create_ration_bundle',
      description:
        'Save a finalized daily meal plan as a subscription bundle. Only use IDs returned by search_menu_dishes or create_catalog_product — never invent IDs.',
      schema: z.object({
        name: z.string().describe('Name of the meal plan'),
        productIds: z
          .array(z.string())
          .describe('Array of real Medusa product IDs in this plan'),
        totalCalories: z.number().describe('Total daily kilocalories'),
        description: z
          .string()
          .optional()
          .describe('Optional plan description for customers'),
      }),
    },
  );

  return [searchMenuTool, createRationBundleTool];
};
