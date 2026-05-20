"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type RationDishVariant = {
  id: string
  title: string
  sku: string | null
  metadata: Record<string, any> | null
  product: {
    id: string
    title: string
    thumbnail: string | null
    description: string | null
    images: { id: string; url: string }[]
  } | null
}

export type RationItem = {
  id: string
  meal_type: string
  dish_variant: RationDishVariant | null
}

export const getRationItems = async (
  variantId: string,
): Promise<RationItem[]> => {
  const next = await getCacheOptions("ration-plan")

  const data = await sdk.client.fetch<{ ration_items: RationItem[] }>(
    `/store/ration-plan/${variantId}`,
    {
      method: "GET",
      next,
    },
  )

  return data.ration_items ?? []
}
