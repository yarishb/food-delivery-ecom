import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import WeeklyPlanClient from "./weekly-plan-client"

export default async function WeeklyPlan() {
  const categories = await listCategories({
    parent_category_id: null,
  })

  const {
    response: { products },
  } = await listProducts({
    countryCode: "ua",
    queryParams: {
      fields: "*categories,*variants.calculated_price,+metadata",
      handle: ["ration-weight-loss", "ration-balance", "ration-muscle-gain"],
      limit: 100,
    },
  })

  return (
    <WeeklyPlanClient initialCategories={categories} allProducts={products} />
  )
}
