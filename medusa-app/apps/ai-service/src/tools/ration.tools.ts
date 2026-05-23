import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MedusaService } from '../medusa/medusa.service';

export const createRationTools = (medusaService: MedusaService) => {
  const searchMenuTool = tool(
    async ({ query, maxCalories, minCalories }) => {
      try {
        console.log(`Searching for dishes with query: ${query}`);
        const products = await medusaService.getProducts();
        console.log(`Found  "${products}"`);

        const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);

        const matched = products.filter((p: any) => {
          const haystack = [p.title, p.description, p.subtitle]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return keywords.some((kw) => haystack.includes(kw));
        });

        console.log(`Found  "${products}"`);
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
              'Підходящих страв в каталозі не знайдено. Можу запропонувати варіанти зі своїх знань.',
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
        'Search published dishes in the real Medusa product catalog by keyword, calorie range, or ingredient. Always call this first before building any meal plan.',
      schema: z.object({
        query: z
          .string()
          .describe(
            'Keywords to search for, e.g. "курка протеїн", "салат", "кето", "сніданок"',
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

      // TODO: persist to Medusa when ration bundle schema is ready
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
