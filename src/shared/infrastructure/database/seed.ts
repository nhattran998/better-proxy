import { db } from "./drizzle.client";
import { users, providers } from "./schema";
import { hash } from "bcryptjs";
import { generateId } from "#/shared/utils";

const DEFAULT_ADMIN_USERNAME = process.env.INITIAL_ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "changeme";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if admin exists
  const existingAdmin = await db.query.users.findFirst();
  if (!existingAdmin) {
    const passwordHash = await hash(DEFAULT_ADMIN_PASSWORD, 12);
    await db.insert(users).values({
      id: generateId(),
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash,
      role: "admin",
      createdAt: new Date(),
    });
    console.log(`✅ Created admin user: ${DEFAULT_ADMIN_USERNAME}`);
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // Seed default providers
  const existingProviders = await db.select().from(providers);
  if (existingProviders.length === 0) {
    const defaultProviders = [
      { name: "claude" as const, authType: "api_key" as const },
      { name: "codex" as const, authType: "oauth" as const },
      { name: "opencode" as const, authType: "none" as const },
      { name: "deepseek" as const, authType: "api_key" as const },
      { name: "glm" as const, authType: "api_key" as const },
    ];

    for (const p of defaultProviders) {
      await db.insert(providers).values({
        id: generateId(),
        name: p.name,
        authType: p.authType,
        isActive: true,
        createdAt: new Date(),
      });
    }
    console.log("✅ Created default providers");
  } else {
    console.log("ℹ️  Providers already exist");
  }

  console.log("🎉 Seed complete!");
}

seed().catch(console.error);
