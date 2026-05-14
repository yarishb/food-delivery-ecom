import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
  isRelated = false, // Новий параметр для спрощеного вигляду
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  isRelated?: boolean
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const defaultVariant = product.variants?.[0] as any
  const macros = defaultVariant?.metadata || {}
  const categoryName = product.categories?.[0]?.name || "Healthy Food"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className={`group flex flex-col bg-white overflow-hidden transition-all duration-300 h-full
        ${
          isRelated
            ? "rounded-[1.5rem] shadow-sm hover:shadow-md border border-gray-100"
            : "rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(43,122,62,0.12)] border border-gray-100/50"
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Фото контейнер */}
        <div
          className={`relative w-full overflow-hidden bg-gray-50 ${
            isRelated ? "aspect-square" : "aspect-[4/3]"
          }`}
        >
          {/* Категорія або Калорії зверху */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#2B7A3E] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-10 shadow-sm">
            {isRelated ? `${macros.calories || 0} kcal` : categoryName}
          </div>

          <div className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105 [&>div]:h-full [&>div]:w-full [&_img]:object-cover [&_img]:w-full [&_img]:h-full">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
          </div>
        </div>

        {/* Контентна частина */}
        <div className={`${isRelated ? "p-5" : "p-7"} flex flex-col flex-grow`}>
          <div
            className={`${
              isRelated ? "text-base" : "text-lg"
            } font-extrabold text-[#2B7A3E] whitespace-nowrap [&>span]:text-[#2B7A3E]`}
          >
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <div
            className={`flex justify-between items-start gap-4 ${
              isRelated ? "mb-1" : "mb-3"
            }`}
          >
            <Text
              className={`${
                isRelated ? "text-base" : "text-xl"
              } font-bold text-[#1A2E20]`}
            >
              {product.title}
            </Text>
          </div>

          {/* Опис та КБЖВ показуємо тільки у повному варіанті */}
          {!isRelated && (
            <>
              <Text className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
                {product.description}
              </Text>

              <div className="flex items-center justify-between gap-2 pt-5 border-t border-gray-100">
                {[
                  { label: "Kcal", val: macros.calories || 0 },
                  { label: "Pro", val: macros.protein || 0, unit: "g" },
                  { label: "Fat", val: macros.fat || 0, unit: "g" },
                  { label: "Carb", val: macros.carbs || 0, unit: "g" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex flex-col border border-gray-200 rounded-xl px-2 py-2 min-w-[3.8rem] items-center bg-gray-50/50"
                  >
                    <span className="text-sm font-bold text-[#1A2E20]">
                      {m.val}
                      {m.unit}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition-all border-2 border-[#2B7A3E] text-[#2B7A3E] group-hover:bg-[#2B7A3E] group-hover:text-white flex items-center justify-center gap-2">
                <span>Детальніше</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
