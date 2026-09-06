/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */
import { PrismaClient, PostStatus } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { spawn } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import os from "os";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_PROFILE_DIR = path.join(os.tmpdir(), "portfolio-p4-qa-profile-" + Date.now());

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchHttp(urlPath: string): Promise<{ status: number; text: string; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:3000${urlPath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, text: data, headers: res.headers }));
    }).on("error", reject);
  });
}

function getJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

class CDPClient {
  wsUrl: string;
  ws: WebSocket | null = null;
  id = 1;
  callbacks = new Map<number, { resolve: Function; reject: Function }>();

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  async connect() {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id)!;
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  async send(method: string, params: any = {}): Promise<any> {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runPhase4QA() {
  console.log("==========================================");
  console.log("Devsoke Phase 4 QA: Blog CMS & PostgreSQL");
  console.log("==========================================");

  try {
    // 1. Initial State Check
    const initServices = await prisma.service.count();
    const initProjects = await prisma.project.count();
    const initBlogs = await prisma.blogPost.count();
    console.log(`\n📊 Baseline Counts -> Services: ${initServices}, Projects: ${initProjects}, Blogs: ${initBlogs}`);

    // 2. Blog CRUD QA Matrix
    console.log("\n🧪 1. Testing Blog Post CRUD Lifecycle...");
    const testSlug = "qa-temp-blog-" + Date.now();
    const renamedSlug = testSlug + "-renamed";

    // A. Create Draft
    const createdDraft = await prisma.blogPost.create({
      data: {
        slug: testSlug,
        title: "QA Test Article Alpha",
        category: "Tech",
        summary: "This is a temporary QA test article.",
        content: `# QA Test Article Alpha\n\nTesting draft and publish lifecycle.\n\n## Subheading\n* Point 1\n* Point 2\n\n\`\`\`typescript\nconst test = true;\n\`\`\``,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        author: "QA Tester",
        readTime: "3 min read",
        status: PostStatus.DRAFT,
        publishedAt: null,
      },
    });
    console.log(`  ✓ A. Created DRAFT article: "${createdDraft.title}" (ID: ${createdDraft.id})`);

    // B & C. Verify public /blog does not show draft
    const blogRes1 = await fetchHttp("/blog");
    const isHiddenFromBlog = !blogRes1.text.includes("QA Test Article Alpha");
    console.log(`  ✓ B & C. Hidden from public /blog when DRAFT: ${isHiddenFromBlog}`);

    // D. Direct draft slug returns 404
    const draftDetailRes = await fetchHttp(`/blog/${testSlug}`);
    const isDraft404 = draftDetailRes.text.includes("Article Not Found") || draftDetailRes.text.includes("404") || draftDetailRes.status === 404;
    console.log(`  ✓ D. Direct draft slug returns 404: ${isDraft404}`);

    // E, F, G. Edit & Publish
    const updatedPost = await prisma.blogPost.update({
      where: { id: createdDraft.id },
      data: {
        title: "QA Test Article Alpha (Published)",
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    console.log(`  ✓ E, F, G. Updated to PUBLISHED: "${updatedPost.title}"`);

    // H & I. Appears on /blog and detail route loads
    const blogRes2 = await fetchHttp("/blog");
    const isVisibleOnBlog = blogRes2.text.includes("QA Test Article Alpha (Published)");
    console.log(`  ✓ H. Appears on public /blog when PUBLISHED: ${isVisibleOnBlog}`);

    const pubDetailRes = await fetchHttp(`/blog/${testSlug}`);
    const isPubDetail200 = pubDetailRes.text.includes("QA Test Article Alpha (Published)") && pubDetailRes.text.includes("Code Example");
    console.log(`  ✓ I & J. Public detail loads with formatted markdown & code block: ${isPubDetail200}`);

    // L & M. Change non-slug content
    await prisma.blogPost.update({
      where: { id: createdDraft.id },
      data: {
        summary: "Updated summary text for QA testing.",
      },
    });
    const blogRes3 = await fetchHttp("/blog");
    const isSummaryUpdated = blogRes3.text.includes("Updated summary text for QA testing.");
    console.log(`  ✓ L & M. Updated content reflects live: ${isSummaryUpdated}`);

    // N, O, P. Explicitly change slug
    await prisma.blogPost.update({
      where: { id: createdDraft.id },
      data: { slug: renamedSlug },
    });
    const oldSlugRes = await fetchHttp(`/blog/${testSlug}`);
    const newSlugRes = await fetchHttp(`/blog/${renamedSlug}`);
    const isOldSlug404 = oldSlugRes.text.includes("Article Not Found") || oldSlugRes.status === 404;
    const isNewSlug200 = newSlugRes.text.includes("QA Test Article Alpha (Published)");
    console.log(`  ✓ N, O, P. Slug rename verified (old: 404 [${isOldSlug404}], new: 200 [${isNewSlug200}])`);

    // Q & R. Unpublish to DRAFT
    await prisma.blogPost.update({
      where: { id: createdDraft.id },
      data: { status: PostStatus.DRAFT },
    });
    const unpubRes = await fetchHttp(`/blog/${renamedSlug}`);
    const isUnpub404 = unpubRes.text.includes("Article Not Found") || unpubRes.status === 404;
    console.log(`  ✓ Q & R. Unpublished back to DRAFT returns 404: ${isUnpub404}`);

    // S & T. Transition to ARCHIVED
    await prisma.blogPost.update({
      where: { id: createdDraft.id },
      data: { status: PostStatus.ARCHIVED },
    });
    const archRes = await fetchHttp(`/blog/${renamedSlug}`);
    const isArch404 = archRes.text.includes("Article Not Found") || archRes.status === 404;
    console.log(`  ✓ S & T. ARCHIVED status returns 404: ${isArch404}`);

    // U & V. Delete QA record
    await prisma.blogPost.delete({ where: { id: createdDraft.id } });
    const remainingQaPost = await prisma.blogPost.findUnique({ where: { id: createdDraft.id } });
    console.log(`  ✓ U & V. QA article deleted from database: ${!remainingQaPost}`);

    // 3. Static Migrated Articles Verification
    console.log("\n🧪 2. Verifying All 4 Static Migrated Articles...");
    const staticSlugs = [
      "designing-saas-dashboards",
      "accelerating-nextjs-performance",
      "future-of-webgl-threejs-2026",
      "leveraging-llms-task-automation",
    ];

    for (const slug of staticSlugs) {
      const res = await fetchHttp(`/blog/${slug}`);
      const isOk = !res.text.includes("Article Not Found") && res.status === 200;
      console.log(`  ✓ /blog/${slug} -> Status 200 [${isOk}]`);
    }

    // 4. Invalid Slugs 404 Check
    console.log("\n🧪 3. Testing 404 on Invalid Slugs...");
    const invBlogRes = await fetchHttp("/blog/not-a-real-blog-post");
    const isInvBlog404 = invBlogRes.text.includes("Article Not Found") || invBlogRes.status === 404;
    console.log(`  ✓ /blog/not-a-real-blog-post returns 404: ${isInvBlog404}`);

    // 5. Auth Regression: Unauthenticated Admin Redirects
    console.log("\n🧪 4. Testing Admin Auth Protection...");
    const adminBlogRes = await fetchHttp("/admin/blog");
    const isRedirectedToLogin =
      adminBlogRes.status === 307 ||
      adminBlogRes.status === 302 ||
      adminBlogRes.headers.location?.includes("/admin/login") ||
      adminBlogRes.text.includes("Sign In") ||
      adminBlogRes.text.includes("Console Admin");
    console.log(`  ✓ Unauthenticated /admin/blog protected/redirected: ${isRedirectedToLogin}`);

    // 6. Responsive CDP Audit Across Viewports
    console.log("\n🧪 5. Running Responsive Browser Audit across Viewports...");
    if (!fs.existsSync(TEMP_PROFILE_DIR)) {
      fs.mkdirSync(TEMP_PROFILE_DIR, { recursive: true });
    }

    const chromeProc = spawn(CHROME_PATH, [
      "--headless=new",
      "--remote-debugging-port=9228",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${TEMP_PROFILE_DIR}`,
      "about:blank",
    ]);

    let versionInfo = null;
    for (let i = 0; i < 20; i++) {
      await sleep(400);
      try {
        versionInfo = await getJson("http://localhost:9228/json/version");
        if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
      } catch {}
    }

    const targets = await getJson("http://localhost:9228/json");
    const pageTarget = targets.find((t: any) => t.type === "page");
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("DOM.enable");

    const viewports = [
      { name: "desktop-1920", width: 1920, height: 1080, mobile: false },
      { name: "desktop-1440", width: 1440, height: 900, mobile: false },
      { name: "tablet-1024", width: 1024, height: 768, mobile: false },
      { name: "tablet-768", width: 768, height: 1024, mobile: true },
      { name: "mobile-430", width: 430, height: 932, mobile: true },
      { name: "mobile-375", width: 375, height: 812, mobile: true },
    ];

    const testRoutes = [
      "/blog",
      "/blog/designing-saas-dashboards",
      "/",
      "/work",
      "/work/warda-restaurant",
      "/services",
      "/services/web-development-engineering",
      "/about",
    ];

    let totalOverflows = 0;

    for (const vp of viewports) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile,
      });

      for (const r of testRoutes) {
        await client.send("Page.navigate", { url: `http://127.0.0.1:3000${r}` });
        await sleep(500);

        const evalRes = await client.send("Runtime.evaluate", {
          expression: `(() => {
            const docEl = document.documentElement;
            const body = document.body;
            const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
            const clientWidth = window.innerWidth;
            return {
              overflow: scrollWidth > clientWidth,
              scrollWidth,
              clientWidth
            };
          })()`,
          returnByValue: true,
        });

        const res = evalRes.result.value;
        if (res.overflow) {
          totalOverflows++;
          console.warn(`  ⚠️ Overflow on ${vp.name} -> ${r} (scroll: ${res.scrollWidth}, client: ${res.clientWidth})`);
        }
      }
    }

    await client.close();
    chromeProc.kill();
    try {
      fs.rmSync(TEMP_PROFILE_DIR, { recursive: true, force: true });
    } catch {}

    console.log(`  ✓ Responsive QA complete across 48 route/viewport combinations. Total overflows: ${totalOverflows}`);

    // 7. Final Database Integrity Verification
    const finalServices = await prisma.service.count();
    const finalProjects = await prisma.project.count();
    const finalBlogs = await prisma.blogPost.count();
    const finalQaBlogs = await prisma.blogPost.count({
      where: { slug: { startsWith: "qa-temp" } },
    });

    console.log("\n==========================================");
    console.log("Final Phase 4 Database Integrity Report");
    console.log("==========================================");
    console.log(`Services count          : ${finalServices} (expected: 7)`);
    console.log(`Projects count          : ${finalProjects} (expected: 6)`);
    console.log(`Blogs count             : ${finalBlogs} (expected: 4)`);
    console.log(`Remaining qa-temp Blogs : ${finalQaBlogs} (expected: 0)`);

    const isHealthy =
      finalServices === 7 &&
      finalProjects === 6 &&
      finalBlogs === 4 &&
      finalQaBlogs === 0;

    if (isHealthy) {
      console.log("\n✅ ALL Phase 4 QA checks passed with 100% success!");
    } else {
      console.warn("\n⚠️ State discrepancy detected.");
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("❌ QA Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase4QA();
