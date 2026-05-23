import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { SupabaseService } from '../supabase/supabase.service';
import { MedusaService } from '../medusa/medusa.service';

export const createCatalogTools = (
  _supabaseService: SupabaseService,
  medusaService: MedusaService,
) => {
  const changeProductStatusTool = tool(
    async ({ productId, status }) => {
      try {
        await medusaService.updateProduct(productId, { status });
        const label =
          status === 'published' ? 'опубліковано' : 'приховано (чернетка)';
        return `Успішно. Продукт ${productId} тепер ${label}.`;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return `Помилка оновлення статусу: ${msg}`;
      }
    },
    {
      name: 'change_product_status',
      description:
        'Publish or hide (set to draft) a specific product by its Medusa product ID.',
      schema: z.object({
        productId: z.string().describe('The Medusa product ID'),
        status: z
          .enum(['published', 'draft'])
          .describe('Target visibility status'),
      }),
    },
  );

  const createCatalogProductTool = tool(
    async ({
      title,
      description,
      price,
      category,
      calories,
      handle,
      protein,
      fat,
      carbs,
    }) => {
      try {
        const product = await medusaService.createProduct({
          title,
          description,
          price,
          category,
          calories,
          handle,
          protein,
          fat,
          carbs,
        });
        return `Успішно. Страва "${product?.title}" створена в каталозі з реальним ID: ${product?.id}.`;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return `Помилка створення товару: ${msg}`;
      }
    },
    {
      name: 'create_catalog_product',
      description:
        'Create a new dish in the Medusa.js catalog with complete nutrition and metadata fields.',
      schema: z.object({
        title: z.string().describe('The name of the dish'),
        description: z
          .string()
          .optional()
          .describe('Marketing description with ingredients'),
        price: z.number().default(150).describe('Price in UAH'),
        category: z
          .string()
          .default('Загальне')
          .describe('Category name or diet type'),
        calories: z.number().default(300).describe('Total kilocalories'),
        handle: z
          .string()
          .describe(
            'URL-safe product handle (slug) built from title using lowercase latin characters and hyphens, e.g. "vegan-curry-chickpeas". Do not add slashes!',
          ),
        protein: z.number().default(15).describe('Estimated protein in grams'),
        fat: z.number().default(10).describe('Estimated fat in grams'),
        carbs: z
          .number()
          .default(35)
          .describe('Estimated carbohydrates in grams'),
      }),
    },
  );

  const adjustProductPricesTool = tool(
    async ({ productId, discountPercent, category, discountCode }) => {
      try {
        let targetIds: string[] = [];

        if (productId) {
          targetIds = [productId];
        } else if (category) {
          const products = await medusaService.getProducts();
          targetIds = products
            .filter(
              (p: any) =>
                p.categories?.some((c: any) =>
                  c.name.toLowerCase().includes(category.toLowerCase()),
                ) || p.subtitle?.toLowerCase().includes(category.toLowerCase()),
            )
            .map((p: any) => p.id);
        }

        const code = discountCode || `DISC${discountPercent}_${Date.now()}`;
        await medusaService.createDiscount({
          code,
          percentage: discountPercent,
          productIds: targetIds,
        });

        return `Знижку ${discountPercent}% застосовано. Промокод: ${code}. Охоплено продуктів: ${targetIds.length || 'всі'}.`;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return `Помилка застосування знижки: ${msg}`;
      }
    },
    {
      name: 'adjust_product_prices',
      description:
        'Create a percentage discount for a specific product or a whole category.',
      schema: z.object({
        productId: z.string().optional().describe('Specific Medusa product ID'),
        category: z
          .string()
          .optional()
          .describe('Category name if targeting a whole category'),
        discountPercent: z
          .number()
          .describe('Discount percentage, e.g. 10 for 10%'),
        discountCode: z
          .string()
          .optional()
          .describe('Custom promo code (auto-generated if omitted)'),
      }),
    },
  );

  const bulkUpdateStatusByIngredientTool = tool(
    async ({ ingredient, status }) => {
      try {
        const products = await medusaService.getProducts();
        const keyword = ingredient.toLowerCase();
        const matches = products.filter(
          (p: any) =>
            p.title?.toLowerCase().includes(keyword) ||
            p.description?.toLowerCase().includes(keyword) ||
            p.subtitle?.toLowerCase().includes(keyword),
        );

        await Promise.all(
          matches.map((p: any) =>
            medusaService.updateProduct(p.id, { status }),
          ),
        );

        const label = status === 'published' ? 'опубліковано' : 'приховано';
        const names = matches.map((p: any) => p.title).join(', ');
        return `Успішно. ${matches.length} страв з "${ingredient}" ${label}${matches.length ? `: ${names}` : ''}.`;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return `Помилка масового оновлення: ${msg}`;
      }
    },
    {
      name: 'bulk_update_status_by_ingredient',
      description:
        'Mass publish or hide all dishes that contain a specific ingredient keyword in their title or description.',
      schema: z.object({
        ingredient: z
          .string()
          .describe('Ingredient or keyword to search in product data'),
        status: z.enum(['published', 'draft']).describe('Target status'),
      }),
    },
  );

  const modifyProductRecipeTool = tool(
    async ({
      productId,
      ingredientsToRemove,
      ingredientsToAdd,
      calorieAdjustment,
    }) => {
      try {
        const products = await medusaService.getProducts();
        const product = products.find((p: any) => p.id === productId);
        if (!product) return `Продукт ${productId} не знайдено.`;

        let updatedDesc = product.description || '';
        for (const ing of ingredientsToRemove) {
          updatedDesc = updatedDesc.replace(new RegExp(ing, 'gi'), '').trim();
        }
        if (ingredientsToAdd.length) {
          updatedDesc += `. Додано: ${ingredientsToAdd.join(', ')}`;
        }

        const currentCalories = parseInt(
          product.subtitle?.match(/\d+/)?.[0] || '0',
        );
        const newCalories = currentCalories + calorieAdjustment;

        await medusaService.updateProduct(productId, {
          description: updatedDesc,
          subtitle: `Калорійність: ${newCalories} ккал`,
        });

        return `Успішно. Рецепт "${product.title}" оновлено. Нова калорійність: ${newCalories} ккал.`;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return `Помилка зміни рецепту: ${msg}`;
      }
    },
    {
      name: 'modify_product_recipe',
      description:
        'Modify the ingredient list and calorie count of an existing dish.',
      schema: z.object({
        productId: z.string().describe('Medusa product ID'),
        ingredientsToRemove: z
          .array(z.string())
          .default([])
          .describe('Ingredients to remove'),
        ingredientsToAdd: z
          .array(z.string())
          .default([])
          .describe('Ingredients to add'),
        calorieAdjustment: z
          .number()
          .default(0)
          .describe('Delta to add or subtract from current calories'),
      }),
    },
  );

  return [
    changeProductStatusTool,
    createCatalogProductTool,
    adjustProductPricesTool,
    bulkUpdateStatusByIngredientTool,
    modifyProductRecipeTool,
  ];
};
