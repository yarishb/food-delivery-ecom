import { model } from "@medusajs/framework/utils";

const RationItem = model.define("ration_item", {
  id: model.id().primaryKey(),
  meal_type: model.text(),
  dish_variant_id: model.text(),
});

export default RationItem;
