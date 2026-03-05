import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// .env.local 로드 (Next.js 로컬 환경변수)
config({ path: path.join(__dirname, ".env.local") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
