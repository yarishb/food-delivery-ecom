import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  );

  // Тільки Україна
  const countries = ["ua"];

  logger.info("Налаштування магазину...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Основний канал продажів",
          description: "Головний канал для сайту доставки",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Public API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Green Balance",
          supported_currencies: [
            {
              currency_code: "uah",
              is_default: true,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Налаштування регіону...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Україна",
          currency_code: "uah",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];

  logger.info("Налаштування податків...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  logger.info("Налаштування складу...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: "Головна кухня",
          address: {
            city: "Львів",
            country_code: "UA",
            address_1: "вул. Центральна, 1",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Налаштування логістики...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Кур'єрська доставка",
    type: "shipping",
    service_zones: [
      {
        name: "Україна",
        geo_zones: [
          {
            country_code: "ua",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Доставка кур'єром",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Доставка до дверей у вказаний час",
          code: "courier",
        },
        prices: [
          {
            currency_code: "uah",
            amount: 8000, // 80 грн
          },
          {
            region_id: region.id,
            amount: 8000,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });

  logger.info("Додавання товарів...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        { name: "Раціони", is_active: true },
        { name: "Боули", is_active: true },
        { name: "Напої", is_active: true },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Лососевий боул з кіноа",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Боули")!.id,
          ],
          description:
            "Свіжий лосось, кіноа, авокадо, едамаме та фірмовий кунжутний соус. Здоровий обід з високим вмістом Омега-3.",
          handle: "salmon-quinoa-bowl",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: [
              "лосось слабосолоний",
              "кіноа",
              "авокадо",
              "боби едамаме",
              "огірок",
              "соус",
            ],
            allergens: ["риба", "кунжут", "соя"],
          },
          options: [
            {
              title: "Розмір порції",
              values: ["Стандарт (350г)", "Максі (500г)"],
            },
          ],
          variants: [
            {
              title: "Стандартна порція",
              sku: "BOWL-SALMON-STD",
              options: {
                "Розмір порції": "Стандарт (350г)",
              },
              metadata: { calories: 420, protein: 28, fat: 18, carbs: 35 },
              prices: [
                { amount: 35000, currency_code: "uah" }, // 350 грн
              ],
            },
            {
              title: "Максі порція",
              sku: "BOWL-SALMON-MAX",
              options: {
                "Розмір порції": "Максі (500г)",
              },
              metadata: { calories: 600, protein: 40, fat: 25, carbs: 50 },
              prices: [
                { amount: 48000, currency_code: "uah" }, // 480 грн
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Денний раціон «Баланс»",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Раціони")!.id,
          ],
          description:
            "Повноцінне меню на весь день: сніданок, обід, вечеря та 2 перекуси. Ідеально для підтримки форми.",
          handle: "daily-ration-balance",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            meals_included: 5,
            diet_type: "Збалансоване харчування",
          },
          options: [
            {
              title: "Калорійність",
              values: ["1500 ккал", "2000 ккал"],
            },
          ],
          variants: [
            {
              title: "1500 ккал",
              sku: "RATION-BAL-1500",
              options: {
                Калорійність: "1500 ккал",
              },
              metadata: { protein: 100, fat: 50, carbs: 150 },
              prices: [
                { amount: 120000, currency_code: "uah" }, // 1200 грн
              ],
            },
            {
              title: "2000 ккал",
              sku: "RATION-BAL-2000",
              options: {
                Калорійність: "2000 ккал",
              },
              metadata: { protein: 130, fat: 70, carbs: 200 },
              prices: [
                { amount: 140000, currency_code: "uah" }, // 1400 грн
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  });

  logger.info("Оновлення залишків на складі...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 50,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Готово! Дані успішно завантажено.");
}
