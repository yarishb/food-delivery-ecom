import { MedusaService } from "@medusajs/framework/utils";
import RationItem from "./models/ration-item";

class RationPlanModuleService extends MedusaService({
  RationItem,
}) {}

export default RationPlanModuleService;
