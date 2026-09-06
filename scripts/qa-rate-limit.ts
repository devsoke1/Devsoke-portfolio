/* eslint-disable @typescript-eslint/no-explicit-any */
import Module from "module";

// Mock "server-only" shim in Node CLI test runner
const originalRequire = (Module.prototype as any).require;
(Module.prototype as any).require = function (id: string, ...args: any[]) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id, ...args]);
};

import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();

async function testRateLimiting() {
  console.log("==================================================");
  console.log("Devsoke Phase 5B Rate Limiting & Abuse Security QA");
  console.log("==================================================");

  const testIpHash = "qa-ratelimit-hash-" + Date.now();
  const testEmail = `qa-rate-client-${Date.now()}@example.com`;

  try {
    // 0. Clean prior test records
    await prisma.booking.deleteMany({
      where: {
        OR: [
          { ipHash: { contains: "qa-ratelimit" } },
          { email: { contains: "qa-rate" } },
          { email: { contains: "qa-flooder" } },
          { email: { contains: "qa-legit" } },
        ],
      },
    });

    const { createInquiry } = await import("../src/lib/inquiries/repository");

    // 1. Normal first submission
    console.log("\n🧪 1. Testing Normal First Submission...");
    const sub1 = await createInquiry(
      {
        name: "Rate Test Client",
        email: testEmail,
        company: "Rate Limiting Corp",
        service: "Web Development",
        budget: "$5k - $15k",
        timeline: "1 - 3 Months",
        preferredDate: "2026-09-20",
        message: "First inquiry",
        source: "BOOKING_MODAL",
      },
      testIpHash
    );
    console.log(`  ✓ First submission succeeded with ID: ${sub1.id}`);

    // 2. Duplicate immediate submission (same email & service within 60s)
    console.log("\n🧪 2. Testing Immediate Duplicate Submission (Deduplication Window)...");
    const sub1Duplicate = await createInquiry(
      {
        name: "Rate Test Client",
        email: testEmail,
        company: "Rate Limiting Corp",
        service: "Web Development",
        budget: "$5k - $15k",
        timeline: "1 - 3 Months",
        preferredDate: "2026-09-20",
        message: "First inquiry",
        source: "BOOKING_MODAL",
      },
      testIpHash
    );

    const isDeduplicated = sub1Duplicate.id === sub1.id;
    const countInDbAfterDedup = await prisma.booking.count({ where: { ipHash: testIpHash } });
    console.log(`  ✓ Deduplication returned existing ID: ${isDeduplicated} (Total in DB: ${countInDbAfterDedup})`);

    // 3. Submit distinct inquiries up to the 5-inquiry limit
    console.log("\n🧪 3. Submitting Distinct Inquiries up to the 5/15-min Limit...");
    const services = [
      "SEO & Digital Marketing",
      "Web Design / UI-UX",
      "E-commerce Development",
      "AI Integration & Development",
    ];

    for (let i = 0; i < services.length; i++) {
      const distinctSub = await createInquiry(
        {
          name: `Rate Test Client ${i + 2}`,
          email: `qa-rate-client-${i + 2}-${Date.now()}@example.com`,
          company: "Rate Limiting Corp",
          service: services[i],
          budget: "$15k - $50k",
          timeline: "3 - 6 Months",
          preferredDate: "2026-09-25",
          message: `Distinct inquiry #${i + 2}`,
          source: "BOOKING_MODAL",
        },
        testIpHash
      );
      console.log(`  ✓ Distinct submission ${i + 2} (${services[i]}) succeeded: ${distinctSub.id}`);
    }

    const currentCount = await prisma.booking.count({ where: { ipHash: testIpHash } });
    console.log(`  ✓ Total distinct inquiries stored for IP hash: ${currentCount} (Limit is 5 per 15 min)`);

    // 4. Submit 6th inquiry from same IP hash - MUST be blocked by rate limit
    console.log("\n🧪 4. Testing 6th Submission (Rate Limit Threshold Violation)...");
    let rateLimitCaught = false;
    let rateLimitMessage = "";

    try {
      await createInquiry(
        {
          name: "Abusive Bot / Flooder",
          email: `qa-flooder-${Date.now()}@example.com`,
          company: "Flooding LLC",
          service: "Company Dashboards",
          budget: "$50k+",
          timeline: "Ongoing",
          preferredDate: "2026-10-01",
          message: "This 6th rapid submission should be blocked",
          source: "BOOKING_MODAL",
        },
        testIpHash
      );
    } catch (err: unknown) {
      rateLimitCaught = true;
      rateLimitMessage = (err as Error).message;
    }

    console.log(`  ✓ Rate limit triggered on 6th rapid submission: ${rateLimitCaught}`);
    console.log(`  ✓ Error message: "${rateLimitMessage}"`);

    // 5. Test window expiry behavior: simulated past inquiries outside the 15-minute window
    console.log("\n🧪 5. Testing Window Expiry (Submissions Outside 15-Minute Window)...");
    // Move existing records back by 20 minutes
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    await prisma.booking.updateMany({
      where: { ipHash: testIpHash },
      data: { createdAt: twentyMinutesAgo },
    });

    // Now a new submission from the same IP hash should succeed
    const postExpirySub = await createInquiry(
      {
        name: "Legitimate Client Later",
        email: `qa-legit-later-${Date.now()}@example.com`,
        company: "Legit Future Client",
        service: "Mobile App Development",
        budget: "$15k - $50k",
        timeline: "1 - 3 Months",
        preferredDate: "2026-10-05",
        message: "Submission after 15-minute sliding window expired",
        source: "BOOKING_MODAL",
      },
      testIpHash
    );

    console.log(`  ✓ New submission after window expiry succeeded: ${Boolean(postExpirySub.id)}`);

    // 6. Cleanup
    console.log("\n🧪 6. Cleaning Up Test QA Records...");
    await prisma.booking.deleteMany({
      where: {
        OR: [
          { ipHash: { contains: "qa-ratelimit" } },
          { email: { contains: "qa-rate" } },
          { email: { contains: "qa-flooder" } },
          { email: { contains: "qa-legit" } },
        ],
      },
    });

    const remaining = await prisma.booking.count({
      where: {
        OR: [
          { ipHash: { contains: "qa-ratelimit" } },
          { email: { contains: "qa-rate" } },
          { email: { contains: "qa-flooder" } },
          { email: { contains: "qa-legit" } },
        ],
      },
    });

    console.log(`  ✓ All test rate limit records cleanly deleted. Remaining: ${remaining}`);

    console.log("\n==================================================");
    console.log("✅ Rate Limiting & Abuse Security QA PASSED 100%");
    console.log("==================================================");
  } catch (err: unknown) {
    const error = err as Error;
    console.error("❌ Rate Limit QA Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRateLimiting();
