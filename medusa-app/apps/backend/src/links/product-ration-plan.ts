import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";

// One plan variant → many RationItems (one per meal slot).
export const ProductVariantToRationItemLink = defineLink(
  ProductModule.linkable.productVariant,
  {
    linkable: {
      serviceName: "ration_plan",
      linkable: "ration_item_id",
      field: "rationItem",
      primaryKey: "id",
      entity: "RationItem",
    } as any,
    isList: true,
  },
);
