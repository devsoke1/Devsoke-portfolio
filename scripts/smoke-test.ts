import http from "http";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();

function httpRequest(
  options: http.RequestOptions
): Promise<{ status: number; text: string; location?: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          status: res.statusCode ?? 0,
          text: buffer.toString("utf8"),
          location: res.headers.location,
        });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function runSmokeTests() {
  console.log("==================================================");
  console.log("Devsoke Production Smoke Test & Route Audit");
  console.log("==================================================");

  // 1. Create temporary authenticated session
  const adminUser = await prisma.adminUser.findFirst();
  if (!adminUser) throw new Error("No admin user found");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHmac("sha256", process.env.AUTH_SECRET || "dev-secret")
    .update(rawToken)
    .digest("hex");

  const session = await prisma.adminSession.create({
    data: {
      adminUserId: adminUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const authCookie = `devsoke_admin_session=${rawToken}`;

  // Find real slugs from PostgreSQL
  const realProject = await prisma.project.findFirst({ where: { isPublished: true } });
  const realService = await prisma.service.findFirst({ where: { isPublished: true } });
  const realBlog = await prisma.blogPost.findFirst({ where: { status: "PUBLISHED" } });

  console.log(`\n📋 Real PostgreSQL Slugs Discovered:`);
  console.log(`  - Real Project : /work/${realProject?.slug}`);
  console.log(`  - Real Service : /services/${realService?.slug}`);
  console.log(`  - Real Blog    : /blog/${realBlog?.slug}`);

  const publicRoutes = [
    { path: "/", expectedStatus: 200 },
    { path: "/about", expectedStatus: 200 },
    { path: "/contact", expectedStatus: 200 },
    { path: "/privacy", expectedStatus: 200 },
    { path: "/terms", expectedStatus: 200 },
    { path: "/work", expectedStatus: 200 },
    ...(realProject ? [{ path: `/work/${realProject.slug}`, expectedStatus: 200 }] : []),
    { path: "/services", expectedStatus: 200 },
    ...(realService ? [{ path: `/services/${realService.slug}`, expectedStatus: 200 }] : []),
    { path: "/blog", expectedStatus: 200 },
    ...(realBlog ? [{ path: `/blog/${realBlog.slug}`, expectedStatus: 200 }] : []),
    { path: "/admin/login", expectedStatus: 200 },
    { path: "/work/nonexistent-slug-xyz", expectedStatus: 404 },
    { path: "/services/nonexistent-slug-xyz", expectedStatus: 404 },
    { path: "/blog/nonexistent-slug-xyz", expectedStatus: 404 },
  ];

  console.log("\n🌐 Public Routes Smoke Test:");
  let publicPassed = 0;
  for (const route of publicRoutes) {
    const res = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: route.path,
      method: "GET",
    });

    const passed = res.status === route.expectedStatus;
    console.log(`  ${passed ? "✓" : "❌"} ${route.path.padEnd(50)} -> Status ${res.status} (expected ${route.expectedStatus})`);
    if (passed) publicPassed++;
  }

  const adminRoutes = [
    "/admin/dashboard",
    "/admin/projects",
    "/admin/services",
    "/admin/blog",
    "/admin/media",
    "/admin/inquiries",
  ];

  console.log("\n🔒 Authenticated Admin Routes Smoke Test:");
  let adminPassed = 0;
  for (const route of adminRoutes) {
    const res = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: route,
      method: "GET",
      headers: { Cookie: authCookie },
    });

    const passed = res.status === 200;
    console.log(`  ${passed ? "✓" : "❌"} ${route.padEnd(50)} -> Status ${res.status} (expected 200)`);
    if (passed) adminPassed++;
  }

  // Cleanup session
  await prisma.adminSession.delete({ where: { id: session.id } });
  await prisma.$disconnect();

  console.log("\n==================================================");
  console.log(`Smoke Test Summary: ${publicPassed}/${publicRoutes.length} public passed, ${adminPassed}/${adminRoutes.length} admin passed.`);
  console.log("==================================================");

  if (publicPassed === publicRoutes.length && adminPassed === adminRoutes.length) {
    console.log("✅ ALL PRODUCTION SMOKE TESTS PASSED!");
  } else {
    process.exit(1);
  }
}

runSmokeTests();

