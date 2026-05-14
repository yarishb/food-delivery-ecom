import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sdk } from "@lib/config" // Переконайтеся, що SDK підключено для запиту категорій

const PRODUCT_LIMIT = 12

// Допоміжна функція для отримання списку категорій (можна винести в @lib/data/categories)
async function getCategories() {
  const { product_categories } = await sdk.client.fetch<{
    product_categories: any[]
  }>("/store/product-categories", {
    method: "GET",
    query: { fields: "id,name,handle" },
  })
  return product_categories
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId, // Це значення з URL (query param)
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  const categories = await getCategories()

  if (!region) {
    return null
  }

  // Налаштування параметрів запиту
  const queryParams: any = {
    limit: PRODUCT_LIMIT,
    // ВАЖЛИВО: додаємо категорії у поля, щоб працювали бейджі в ProductPreview
    fields: "*categories,*variants.calculated_price,+metadata",
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  // ВИПРАВЛЕННЯ: Medusa v2 очікує масив для category_id
  if (categoryId) {
    queryParams["category_id"] = Array.isArray(categoryId)
      ? categoryId
      : [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <div className="flex flex-col w-full">
      {/* Навігація по категоріях у стилі Green Balance */}
      <div className="flex justify-center mb-12">
        <div className="flex gap-2 p-1.5 bg-white rounded-full shadow-sm border border-gray-100 overflow-x-auto max-w-full no-scrollbar">
          <LocalizedClientLink
            href="/store"
            scroll={false}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              !categoryId
                ? "bg-[#2B7A3E] text-white shadow-md"
                : "text-gray-500 hover:text-[#1A2E20] hover:bg-gray-50"
            }`}
          >
            Всі
          </LocalizedClientLink>

          {categories.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/store?category_id=${cat.id}`}
              scroll={false}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                categoryId === cat.id
                  ? "bg-[#2B7A3E] text-white shadow-md"
                  : "text-gray-500 hover:text-[#1A2E20] hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </LocalizedClientLink>
          ))}
        </div>
      </div>

      {/* Сітка продуктів */}
      {products.length > 0 ? (
        <ul
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          data-testid="products-list"
        >
          {products.map((p) => (
            <li key={p.id} className="flex">
              <ProductPreview product={p} region={region} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">🥗</div>
          <h3 className="text-xl font-bold text-[#1A2E20]">
            Нічого не знайдено
          </h3>
          <p className="text-gray-500 mt-2">
            У цій категорії поки немає доступних страв.
          </p>
        </div>
      )}

      {/* Пагінація */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center">
          <Pagination
            data-testid="product-pagination"
            page={page}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}
