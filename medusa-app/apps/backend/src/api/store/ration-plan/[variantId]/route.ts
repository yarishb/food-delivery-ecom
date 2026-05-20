import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const { variantId } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "ration_items.*",
    ],
    filters: { id: variantId },
  });

  const variant = variants[0];
  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  const rationItems = (variant as any).ration_items ?? [];

  // Resolve dish variant details for each ration item
  const dishVariantIds: string[] = rationItems
    .map((item: any) => item.dish_variant_id)
    .filter(Boolean);

  let dishVariantsMap: Map<string, any> = new Map();

  if (dishVariantIds.length > 0) {
    const { data: dishVariants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "title",
        "sku",
        "metadata",
        "product.id",
        "product.title",
        "product.thumbnail",
        "product.description",
        "product.images.id",
        "product.images.url",
      ],
      filters: { id: dishVariantIds },
    });

    dishVariants.forEach((dv: any) => {
      dishVariantsMap.set(dv.id, dv);
    });
  }

  const enrichedItems = rationItems.map((item: any) => ({
    id: item.id,
    meal_type: item.meal_type,
    dish_variant: dishVariantsMap.get(item.dish_variant_id) ?? null,
  }));

  res.status(200).json({ ration_items: enrichedItems });
}
