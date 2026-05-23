// у мікросервісі Medusa: src/subscribers/product-sync.ts
import { IProductModuleService } from "@medusajs/framework/types";
import { SubscriberConfig, SubscriberArgs } from "@medusajs/medusa";

export default async function productUpsertHandler({
  event,
  container,
}: SubscriberArgs<any>) {
  const productId = event.data.id;

  const productService = container.resolve<IProductModuleService>(
    "productModuleService",
  );
  const product = await productService.retrieveProduct(productId);

  try {
    await fetch(
      `${process.env.AI_SERVICES_URL}/medusa-webhook/on-product-change`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record: product,
          type: "INSERT",
        }),
      },
    );
  } catch (error) {
    console.error("Не вдалося відправити продукт в ai-services:", error);
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
  context: { subscriberId: "product-embedding-indexer" },
};
