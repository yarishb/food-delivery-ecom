import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import WeeklyPlan from "@modules/home/components/weekly-plan"
import ProcessSection from "@modules/home/components/process-section"
import TimeEfficiency from "@modules/home/components/time-efficiency"
import CoffeeRitual from "@modules/home/components/coffee-ritual"
import DeliveryZones from "@modules/home/components/delivery-zones"

export const metadata: Metadata = {
  title: "Green Balance - Доставка здорової їжі",
  description: "Замовляйте здорову, поживну їжу з доставкою до дверей.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <WeeklyPlan />
      <ProcessSection />
      <TimeEfficiency />
      <CoffeeRitual />
      <DeliveryZones />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
