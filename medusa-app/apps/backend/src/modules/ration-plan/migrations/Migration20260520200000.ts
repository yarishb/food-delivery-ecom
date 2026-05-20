import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260520200000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ration_item" add column if not exists "dish_variant_id" text not null default '';`);
    this.addSql(`alter table if exists "ration_item" alter column "dish_variant_id" drop default;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "ration_item" drop column if exists "dish_variant_id";`);
  }

}
