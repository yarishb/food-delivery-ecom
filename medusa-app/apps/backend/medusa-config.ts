import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";
import { RATION_PLAN_MODULE } from "./src/modules/ration-plan";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

console.log("DATABASE_URL:", process.env.DATABASE_URL);

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    [Modules.FILE]: {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_PUBLIC_URL,
              bucket: process.env.S3_BUCKET,
              region: process.env.S3_REGION || "eu-west-1",
              access_key_id: process.env.S3_ACCESS_KEY,
              secret_access_key: process.env.S3_SECRET_KEY,
              additional_client_config: {
                forcePathStyle: true,
                endpoint: process.env.S3_ENDPOINT,
                followRegionRedirects: false,
              },
            },
          },
        ],
      },
    },
    [RATION_PLAN_MODULE]: {
      resolve: "./src/modules/ration-plan",
    },
  },
});
