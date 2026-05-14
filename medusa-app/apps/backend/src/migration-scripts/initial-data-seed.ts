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

  const countries = ["ua"];

  logger.info("1. Налаштування каналів продажів та ключів...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Web Store",
          description: "Головний канал продажу для веб-додатку Green Balance",
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
          created_by: "system",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [defaultSalesChannel.id] },
  });

  logger.info("2. Створення магазину та регіону...");
  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Green Balance Lviv",
          supported_currencies: [{ currency_code: "uah", is_default: true }],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

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

  logger.info("3. Налаштування податків...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  logger.info("4. Налаштування складу (Dark Kitchen)...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: "Головна кухня (Львів)",
          address: {
            city: "Львів",
            country_code: "UA",
            address_1: "вул. Героїв УПА, 73",
            postal_code: "79000",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [defaultSalesChannel.id] },
  });

  logger.info("5. Налаштування логістики (Доставка та Самовивіз)...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Локальна логістика Львів",
    type: "shipping",
    service_zones: [
      {
        name: "Львів та передмістя",
        geo_zones: [{ country_code: "ua", type: "country" }], // В реальності тут можна налаштувати за zip-кодами
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Доставка кур'єром (Завтра з 07:00 до 10:00)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Адресна доставка раціонів",
          code: "courier",
        },
        prices: [{ currency_code: "uah", amount: 10000 }], // 100 грн
        rules: [{ attribute: "is_return", value: "false", operator: "eq" }],
      },
      {
        name: "Самовивіз (вул. Героїв УПА, 73)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Pickup",
          description: "Забрати з нашої кухні",
          code: "pickup",
        },
        prices: [{ currency_code: "uah", amount: 0 }], // Безкоштовно
        rules: [{ attribute: "is_return", value: "false", operator: "eq" }],
      },
    ],
  });

  logger.info("6. Створення дерева категорій...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        { name: "Денні раціони", is_active: true, handle: "daily-rations" },
        { name: "Сніданки", is_active: true, handle: "breakfasts" },
        { name: "Основні страви", is_active: true, handle: "main-courses" },
        { name: "Салати та Боули", is_active: true, handle: "salads-bowls" },
        {
          name: "Здорові десерти",
          is_active: true,
          handle: "healthy-desserts",
        },
        { name: "Напої", is_active: true, handle: "drinks" },
      ],
    },
  });

  const getCatId = (name: string) =>
    categoryResult.find((c) => c.name === name)?.id;

  logger.info("7. Наповнення бази продуктами...");
  await createProductsWorkflow(container).run({
    input: {
      products: [
        // --- ДЕННІ РАЦІОНИ ---
        {
          title: "Раціон «Weight Loss» (Схуднення)",
          category_ids: [getCatId("Денні раціони")!],
          description:
            "Збалансоване меню з дефіцитом калорій для комфортного та безпечного зниження ваги. 4 прийоми їжі.",
          handle: "ration-weight-loss",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            meals: 4,
            diet_type: "Схуднення",
            tags: ["low carb", "популярне"],
          },
          options: [
            { title: "Калорійність", values: ["1000 ккал", "1200 ккал"] },
          ],
          variants: [
            {
              title: "1000 ккал",
              sku: "RAT-WL-1000",
              options: { Калорійність: "1000 ккал" },
              metadata: { protein: 85, fat: 40, carbs: 75 },
              prices: [{ amount: 105000, currency_code: "uah" }], // 1050 грн
            },
            {
              title: "1200 ккал",
              sku: "RAT-WL-1200",
              options: { Калорійність: "1200 ккал" },
              metadata: { protein: 95, fat: 45, carbs: 100 },
              prices: [{ amount: 115000, currency_code: "uah" }], // 1150 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Раціон «Balance» (Підтримка форми)",
          category_ids: [getCatId("Денні раціони")!],
          description:
            "Повноцінне меню на 5 прийомів їжі. Ідеально підходить для підтримки поточної ваги та здорового травлення.",
          handle: "ration-balance",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: { meals: 5, diet_type: "Баланс", tags: ["збалансоване"] },
          options: [
            { title: "Калорійність", values: ["1500 ккал", "2000 ккал"] },
          ],
          variants: [
            {
              title: "1500 ккал",
              sku: "RAT-BAL-1500",
              options: { Калорійність: "1500 ккал" },
              metadata: { protein: 110, fat: 55, carbs: 140 },
              prices: [{ amount: 130000, currency_code: "uah" }], // 1300 грн
            },
            {
              title: "2000 ккал",
              sku: "RAT-BAL-2000",
              options: { Калорійність: "2000 ккал" },
              metadata: { protein: 140, fat: 75, carbs: 190 },
              prices: [{ amount: 155000, currency_code: "uah" }], // 1550 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },

        // --- СНІДАНКИ ---
        {
          title: "Авокадо-тост з яйцем пашот",
          category_ids: [getCatId("Сніданки")!],
          description:
            "Цільнозерновий крафтовий хліб, гуакамоле, мікс насіння та ідеальне яйце пашот.",
          handle: "avocado-toast-poached-egg",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: [
              "хліб цільнозерновий",
              "авокадо",
              "яйце",
              "мікс насіння",
              "мікрогрін",
            ],
            allergens: ["глютен", "яйця"],
          },
          options: [{ title: "Порція", values: ["Стандарт (220г)"] }],
          variants: [
            {
              title: "Стандарт",
              sku: "BRK-AVO-TOAST",
              options: { Порція: "Стандарт (220г)" },
              metadata: { calories: 340, protein: 14, fat: 18, carbs: 32 },
              prices: [{ amount: 26000, currency_code: "uah" }], // 260 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Сирники з кокосовим згущеним молоком",
          category_ids: [getCatId("Сніданки")!],
          description:
            "Запечені сирники з нежирного кисломолочного сиру з додаванням рисового борошна. Подаються з натуральною кокосовою згущенкою.",
          handle: "syrnyky-coconut",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: [
              "сир кисломолочний 5%",
              "рисове борошно",
              "яйця",
              "кокосова згущенка",
            ],
            allergens: ["лактоза", "яйця"],
          },
          options: [{ title: "Порція", values: ["Стандарт (250г)"] }],
          variants: [
            {
              title: "Стандарт",
              sku: "BRK-SYRNYKY",
              options: { Порція: "Стандарт (250г)" },
              metadata: { calories: 380, protein: 32, fat: 12, carbs: 36 },
              prices: [{ amount: 24000, currency_code: "uah" }], // 240 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },

        // --- ОСНОВНІ СТРАВИ ---
        {
          title: "Стейк лосося з диким рисом",
          category_ids: [getCatId("Основні страви")!],
          description:
            "Соковитий лосось су-від з гарніром із дикого рису та бланшованою спаржею.",
          handle: "salmon-wild-rice",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: ["лосось", "дикий рис", "спаржа", "оливкова олія"],
            allergens: ["риба"],
          },
          options: [{ title: "Порція", values: ["Стандарт (320г)"] }],
          variants: [
            {
              title: "Стандарт",
              sku: "MAIN-SALMON-RICE",
              options: { Порція: "Стандарт (320г)" },
              metadata: { calories: 450, protein: 34, fat: 24, carbs: 25 },
              prices: [{ amount: 56000, currency_code: "uah" }], // 560 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Куряча грудка гриль з кіноа та овочами",
          category_ids: [getCatId("Основні страви")!],
          description:
            "Дієтичне філе птиці, приготоване на грилі без додавання олії. Подається з кіноа та печеними коренеплодами.",
          handle: "chicken-quinoa",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: ["куряче філе", "кіноа", "морква", "цукіні", "спеції"],
            allergens: ["відсутні"],
          },
          options: [{ title: "Порція", values: ["Стандарт (350г)"] }],
          variants: [
            {
              title: "Стандарт",
              sku: "MAIN-CHICKEN-QUINOA",
              options: { Порція: "Стандарт (350г)" },
              metadata: { calories: 390, protein: 42, fat: 8, carbs: 38 },
              prices: [{ amount: 32000, currency_code: "uah" }], // 320 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },

        // --- САЛАТИ ТА БОУЛИ ---
        {
          title: "Зелений Будда-боул",
          category_ids: [getCatId("Салати та Боули")!],
          description:
            "Веганський боул з нутом, броколі, шпинатом, авокадо та тахіні-дресінгом.",
          handle: "green-buddha-bowl",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: ["нут", "броколі", "шпинат", "авокадо", "тахіні"],
            allergens: ["кунжут"],
          },
          options: [{ title: "Порція", values: ["Велика (400г)"] }],
          variants: [
            {
              title: "Велика",
              sku: "BOWL-GREEN-VEGAN",
              options: { Порція: "Велика (400г)" },
              metadata: { calories: 320, protein: 12, fat: 16, carbs: 34 },
              prices: [{ amount: 28000, currency_code: "uah" }], // 280 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },

        // --- ЗДОРОВІ ДЕСЕРТИ ---
        {
          title: "Raw Vegan Манговий чізкейк",
          category_ids: [getCatId("Здорові десерти")!],
          description:
            "Десерт без випікання, цукру та лактози. На основі кеш'ю, фініків та натурального пюре манго.",
          handle: "raw-mango-cheesecake",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: [
              "кеш'ю",
              "фініки",
              "манго",
              "кокосова олія",
              "сироп агави",
            ],
            allergens: ["горіхи"],
          },
          options: [
            {
              title: "Порція",
              values: ["Шматочок (150г)", "Цілий торт (1.2кг)"],
            },
          ],
          variants: [
            {
              title: "Шматочок",
              sku: "DESSERT-MANGO-SLICE",
              options: { Порція: "Шматочок (150г)" },
              metadata: { calories: 280, protein: 6, fat: 18, carbs: 26 },
              prices: [{ amount: 19500, currency_code: "uah" }], // 195 грн
            },
            {
              title: "Цілий торт",
              sku: "DESSERT-MANGO-WHOLE",
              options: { Порція: "Цілий торт (1.2кг)" },
              metadata: { calories: 2240, protein: 48, fat: 144, carbs: 208 },
              prices: [{ amount: 140000, currency_code: "uah" }], // 1400 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },

        // --- НАПОЇ ---
        {
          title: "Матча лате на кокосовому",
          category_ids: [getCatId("Напої")!],
          description:
            "Преміальна японська матча церемоніального грейду зі спіненим кокосовим молоком.",
          handle: "matcha-coconut-latte",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            ingredients: ["матча", "кокосове молоко", "стевія (опціонально)"],
            allergens: ["відсутні"],
          },
          options: [{ title: "Об'єм", values: ["300 мл"] }],
          variants: [
            {
              title: "300 мл",
              sku: "DRINK-MATCHA-300",
              options: { "Об'єм": "300 мл" },
              metadata: { calories: 85, protein: 1, fat: 6, carbs: 7 },
              prices: [{ amount: 13000, currency_code: "uah" }], // 130 грн
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  });

  logger.info("8. Оновлення залишків на складі...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  // Встановлюємо залишок 100 одиниць для всіх варіантів товарів
  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 100,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("✅ Успіх! База даних готова до роботи.");
}
