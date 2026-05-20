import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260520175701 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "ration_item" ("id" text not null, "meal_type" text not null, "dish_variant_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ration_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ration_item_deleted_at" ON "ration_item" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ration_item" cascade;`);
  }

}
