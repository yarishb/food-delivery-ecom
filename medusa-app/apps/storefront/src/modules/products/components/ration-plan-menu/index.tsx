import { getRationItems, RationItem } from "@lib/data/ration-plan"
import Image from "next/image"

const MEAL_ORDER: Record<string, number> = {
  breakfast: 1,
  lunch: 2,
  snack: 3,
  snack_1: 3,
  snack_2: 4,
  dinner: 5,
}

const MEAL_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Сніданок", emoji: "🌅" },
  lunch: { label: "Обід", emoji: "☀️" },
  snack: { label: "Перекус", emoji: "🍏" },
  snack_1: { label: "Перекус", emoji: "🍏" },
  snack_2: { label: "Перекус 2", emoji: "🍵" },
  dinner: { label: "Вечеря", emoji: "🌙" },
}

function getMealLabel(mealType: string) {
  return MEAL_LABELS[mealType] ?? { label: mealType, emoji: "🍽️" }
}

function sortItems(items: RationItem[]) {
  return [...items].sort(
    (a, b) =>
      (MEAL_ORDER[a.meal_type] ?? 99) - (MEAL_ORDER[b.meal_type] ?? 99),
  )
}

function NutritionBadge({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: string
}) {
  return (
    <span className="inline-flex flex-col items-center bg-ui-bg-subtle rounded-lg px-3 py-1.5 text-center">
      <span className="text-xs text-ui-fg-muted font-medium">{label}</span>
      <span className="text-sm font-semibold text-ui-fg-base">
        {value}
        {unit}
      </span>
    </span>
  )
}

function MealCard({ item }: { item: RationItem }) {
  const { label, emoji } = getMealLabel(item.meal_type)
  const dish = item.dish_variant
  const meta = dish?.metadata ?? {}
  const imageSrc =
    dish?.product?.images?.[0]?.url ?? dish?.product?.thumbnail ?? null

  return (
    <div className="flex gap-4 rounded-2xl border border-ui-border-base bg-ui-bg-base overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative flex-shrink-0 w-32 sm:w-40 self-stretch bg-ui-bg-subtle">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={dish?.product?.title ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 128px, 160px"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-4xl min-h-[100px]">
            {emoji}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1 py-4 pr-4">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{emoji}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ui-fg-muted">
            {label}
          </span>
        </div>

        <p className="text-sm font-semibold text-ui-fg-base leading-tight">
          {dish?.product?.title ?? dish?.title ?? "—"}
        </p>

        {dish?.product?.description && (
          <p className="text-xs text-ui-fg-subtle line-clamp-2">
            {dish.product.description}
          </p>
        )}

        {(meta.protein || meta.fat || meta.carbs) && (
          <div className="flex gap-2 mt-1 flex-wrap">
            {meta.protein && (
              <NutritionBadge label="Білки" value={meta.protein} unit="г" />
            )}
            {meta.fat && (
              <NutritionBadge label="Жири" value={meta.fat} unit="г" />
            )}
            {meta.carbs && (
              <NutritionBadge label="Вуглев." value={meta.carbs} unit="г" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function RationPlanMenu({
  variantId,
}: {
  variantId: string
}) {
  const items = await getRationItems(variantId)

  if (!items.length) {
    return null
  }

  const sorted = sortItems(items)

  return (
    <section className="content-container py-12">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-ui-fg-base mb-2">
          Склад раціону
        </h2>
        <p className="text-sm text-ui-fg-subtle mb-8">
          Ваше денне меню для цього варіанту
        </p>

        <div className="flex flex-col gap-4">
          {sorted.map((item) => (
            <MealCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
