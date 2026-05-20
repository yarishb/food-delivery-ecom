import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { RATION_PLAN_MODULE } from "../../modules/ration-plan";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
  const rationPlanModuleService = req.scope.resolve(RATION_PLAN_MODULE);

  try {
    // ----------------------------------------------------------------
    // STEP 1: Create "Muscle Gain" plan if it doesn't exist yet
    // ----------------------------------------------------------------
    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["handle"],
      filters: { handle: "ration-muscle-gain" },
    });

    if (existingProducts.length === 0) {
      const { data: categories } = await query.graph({
        entity: "product_category",
        fields: ["id"],
        filters: { handle: "daily-rations" },
      });
      const { data: shippingProfiles } = await query.graph({
        entity: "shipping_profile",
        fields: ["id"],
      });

      await createProductsWorkflow(req.scope).run({
        input: {
          products: [
            {
              title: "Раціон «Muscle Gain» (Набір маси)",
              category_ids: [categories[0]?.id],
              description:
                "Програма харчування з профіцитом калорій та підвищеним вмістом білка для якісного набору маси.",
              handle: "ration-muscle-gain",
              status: ProductStatus.PUBLISHED,
              shipping_profile_id: shippingProfiles[0]?.id,
              options: [
                { title: "Калорійність", values: ["2500 ккал", "3000 ккал"] },
              ],
              variants: [
                {
                  title: "2500 ккал",
                  sku: "RAT-MG-2500",
                  options: { Калорійність: "2500 ккал" },
                  metadata: { protein: 160, fat: 80, carbs: 285 },
                  prices: [{ amount: 165000, currency_code: "uah" }],
                },
                {
                  title: "3000 ккал",
                  sku: "RAT-MG-3000",
                  options: { Калорійність: "3000 ккал" },
                  metadata: { protein: 190, fat: 95, carbs: 340 },
                  prices: [{ amount: 185000, currency_code: "uah" }],
                },
              ],
            },
          ],
        },
      });
    }

    // ----------------------------------------------------------------
    // STEP 2: Build SKU → variant ID map
    // ----------------------------------------------------------------
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku"],
    });

    const skuMap = new Map<string, string>();
    variants.forEach((v) => {
      if (v.sku) skuMap.set(v.sku, v.id);
    });

    // ----------------------------------------------------------------
    // STEP 3: Distribution matrix — which dish goes into which slot
    //   Each row: one meal slot for one calorie variant
    //   dish_variant_id is stored directly on RationItem (no second link)
    // ----------------------------------------------------------------
    const distributionMatrix = [
      // === WEIGHT LOSS 1000 kcal ===
      { planSku: "RAT-WL-1000", mealType: "breakfast", dishSku: "BRK-AVO-TOAST" },
      { planSku: "RAT-WL-1000", mealType: "lunch",     dishSku: "MAIN-CHICKEN-QUINOA" },
      { planSku: "RAT-WL-1000", mealType: "dinner",    dishSku: "BOWL-GREEN-VEGAN" },

      // === WEIGHT LOSS 1200 kcal ===
      { planSku: "RAT-WL-1200", mealType: "breakfast", dishSku: "BRK-SYRNYKY" },
      { planSku: "RAT-WL-1200", mealType: "lunch",     dishSku: "MAIN-CHICKEN-QUINOA" },
      { planSku: "RAT-WL-1200", mealType: "dinner",    dishSku: "MAIN-SALMON-RICE" },

      // === BALANCE 1500 kcal ===
      { planSku: "RAT-BAL-1500", mealType: "breakfast", dishSku: "BRK-AVO-TOAST" },
      { planSku: "RAT-BAL-1500", mealType: "lunch",     dishSku: "MAIN-SALMON-RICE" },
      { planSku: "RAT-BAL-1500", mealType: "snack",     dishSku: "DESSERT-MANGO-SLICE" },
      { planSku: "RAT-BAL-1500", mealType: "dinner",    dishSku: "BOWL-GREEN-VEGAN" },

      // === BALANCE 2000 kcal ===
      { planSku: "RAT-BAL-2000", mealType: "breakfast", dishSku: "BRK-SYRNYKY" },
      { planSku: "RAT-BAL-2000", mealType: "lunch",     dishSku: "MAIN-SALMON-RICE" },
      { planSku: "RAT-BAL-2000", mealType: "snack",     dishSku: "DRINK-MATCHA-300" },
      { planSku: "RAT-BAL-2000", mealType: "dinner",    dishSku: "MAIN-CHICKEN-QUINOA" },

      // === MUSCLE GAIN 2500 kcal ===
      { planSku: "RAT-MG-2500", mealType: "breakfast", dishSku: "BRK-AVO-TOAST" },
      { planSku: "RAT-MG-2500", mealType: "lunch",     dishSku: "MAIN-CHICKEN-QUINOA" },
      { planSku: "RAT-MG-2500", mealType: "snack",     dishSku: "BRK-SYRNYKY" },
      { planSku: "RAT-MG-2500", mealType: "dinner",    dishSku: "MAIN-SALMON-RICE" },

      // === MUSCLE GAIN 3000 kcal ===
      { planSku: "RAT-MG-3000", mealType: "breakfast", dishSku: "BRK-AVO-TOAST" },
      { planSku: "RAT-MG-3000", mealType: "lunch",     dishSku: "MAIN-CHICKEN-QUINOA" },
      { planSku: "RAT-MG-3000", mealType: "snack_1",   dishSku: "DESSERT-MANGO-SLICE" },
      { planSku: "RAT-MG-3000", mealType: "snack_2",   dishSku: "DRINK-MATCHA-300" },
      { planSku: "RAT-MG-3000", mealType: "dinner",    dishSku: "MAIN-SALMON-RICE" },
    ];

    // ----------------------------------------------------------------
    // STEP 4: Create RationItems + links
    // ----------------------------------------------------------------
    const linksToCreate: any[] = [];

    for (const item of distributionMatrix) {
      const planVariantId = skuMap.get(item.planSku);
      const dishVariantId = skuMap.get(item.dishSku);

      if (!planVariantId || !dishVariantId) continue;

      // dish_variant_id is stored directly on RationItem — no second link needed
      const rationItem = await rationPlanModuleService.createRationItems({
        meal_type: item.mealType,
        dish_variant_id: dishVariantId,
      });

      const rationItemId = Array.isArray(rationItem)
        ? rationItem[0].id
        : rationItem.id;

      linksToCreate.push({
        [Modules.PRODUCT]: { product_variant_id: planVariantId },
        [RATION_PLAN_MODULE]: { ration_item_id: rationItemId },
      });
    }

    if (linksToCreate.length > 0) {
      await link.create(linksToCreate);
    }

    res.status(200).json({
      success: true,
      message: `Successfully built meal plans and linked ${linksToCreate.length} ration items.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
