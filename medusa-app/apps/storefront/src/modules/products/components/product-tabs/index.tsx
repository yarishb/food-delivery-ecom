"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const defaultVariant = product.variants?.[0] as any
  const metadata = defaultVariant?.metadata || {}

  const tabs = [
    {
      label: "Поживна цінність",
      component: (
        <NutritionalInfoTab metadata={metadata} weight={product.weight} />
      ),
    },
    {
      label: "Склад та алергени",
      component: (
        <IngredientsTab metadata={metadata} description={product.description} />
      ),
    },
    {
      label: "Доставка та зберігання",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full border-t border-gray-100 mt-8">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
            className="border-b border-gray-100"
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const NutritionalInfoTab = ({
  metadata,
  weight,
}: {
  metadata: any
  weight?: number | null
}) => {
  return (
    <div className="text-sm py-6 text-gray-600">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
        <div className="flex flex-col gap-y-4">
          <div className="flex justify-between items-baseline border-b border-gray-50 pb-2 gap-x-4">
            <span className="font-medium text-[#1A2E20] shrink-0">
              Калорійність
            </span>
            <span className="text-[#2B7A3E] font-bold whitespace-nowrap text-right">
              {metadata.calories || "-"} ккал
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-gray-50 pb-2 gap-x-4">
            <span className="font-medium text-[#1A2E20] shrink-0">Білки</span>
            <span className="whitespace-nowrap">
              {metadata.protein || "0"} г
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-gray-50 pb-2 gap-x-4">
            <span className="font-medium text-[#1A2E20] shrink-0">Жири</span>
            <span className="whitespace-nowrap">{metadata.fat || "0"} г</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-gray-50 pb-2 gap-x-4">
            <span className="font-medium text-[#1A2E20] shrink-0">
              Вуглеводи
            </span>
            <span className="whitespace-nowrap">{metadata.carbs || "0"} г</span>
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-[#1A2E20]">Вага порції</span>
            <p className="mt-1">{weight ? `${weight} г` : "Стандарт"}</p>
          </div>
          <p className="text-[12px] text-gray-400 italic mt-auto">
            * Розрахунок вказано на одну порцію готової страви.
          </p>
        </div>
      </div>
    </div>
  )
}

const IngredientsTab = ({
  metadata,
  description,
}: {
  metadata: any
  description?: string | null
}) => {
  return (
    <div className="text-sm py-6 text-gray-600 leading-relaxed">
      <div className="flex flex-col gap-y-6">
        <div>
          <span className="font-semibold text-[#1A2E20] block mb-2">
            Склад страви:
          </span>
          <p>
            {metadata.ingredients ||
              description ||
              "Детальний склад уточнюйте у оператора."}
          </p>
        </div>
        {metadata.allergens && (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <span className="font-semibold text-orange-800 block mb-1">
              ⚠️ Алергени:
            </span>
            <p className="text-orange-700">{metadata.allergens}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-sm py-6 text-gray-600">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <span className="font-semibold text-[#1A2E20] block mb-2">
            Зберігання:
          </span>
          <p>
            В холодильнику при температурі від +2°C до +6°C. Термін придатності
            — 48 годин з моменту приготування.
          </p>
        </div>
        <div>
          <span className="font-semibold text-[#1A2E20] block mb-2">
            Як вживати:
          </span>
          <p>
            Рекомендуємо розігріти страву в мікрохвильовій печі (60-90 сек) без
            кришки або на пательні.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
