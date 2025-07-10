import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './utils/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url:'postgresql://neondb_owner:npg_06CuNQPgEhYq@ep-tiny-frost-a5p7w8uf-pooler.us-east-2.aws.neon.tech/ai-mock-interviewer?sslmode=require' ,
  },
});
