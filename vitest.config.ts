// vitest.config.ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    clearMocks: true,
    // قيم اختبار وهمية ثابتة؛ لا تُستخدم أسرار حقيقية في الاختبارات أبداً
    env: {
      AUTH_SECRET: "test-secret-test-secret-test-secret-0123456789",
      ADMIN_PASSWORD: "correct-horse-battery",
      NEXT_PUBLIC_SANITY_PROJECT_ID: "testproject",
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "mycloud",
      CLOUDINARY_API_KEY: "key123",
      CLOUDINARY_API_SECRET: "secret456",
      EMAIL_FROM: "no-reply@example.com",
      EMAIL_TO: "owner@example.com",
      SITE_NAME: "Test Site",
    },
  },
});
