import RationPlanModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const RATION_PLAN_MODULE = "ration_plan";

export default Module(RATION_PLAN_MODULE, {
  service: RationPlanModuleService,
});
