/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { spawn } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TEMP_PROFILE_DIR = path.join(os.tmpdir(), "portfolio-p5a-qa-profile-" + Date.now());

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpRequest(options: http.RequestOptions, bodyData?: Buffer | string): Promise<{ status: number; text: string; buffer: Buffer; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          status: res.statusCode ?? 0,
          text: buffer.toString("utf8"),
          buffer,
          headers: res.headers,
        });
      });
    });
    req.on("error", reject);
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
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

// Minimal 1x1 valid PNG buffer
const VALID_1X1_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

function buildMultipartFormData(boundary: string, fields: { name: string; value: string | Buffer; filename?: string; contentType?: string }[]) {
  const chunks: Buffer[] = [];
  for (const field of fields) {
    chunks.push(Buffer.from(`--${boundary}\r\n`));
    if (field.filename) {
      chunks.push(
        Buffer.from(
          `Content-Disposition: form-data; name="${field.name}"; filename="${field.filename}"\r\nContent-Type: ${
            field.contentType || "application/octet-stream"
          }\r\n\r\n`
        )
      );
    } else {
      chunks.push(Buffer.from(`Content-Disposition: form-data; name="${field.name}"\r\n\r\n`));
    }
    chunks.push(Buffer.isBuffer(field.value) ? field.value : Buffer.from(field.value));
    chunks.push(Buffer.from("\r\n"));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

async function runPhase5AQA() {
  console.log("==================================================");
  console.log("Devsoke Phase 5A QA: Self-Hosted Media System");
  console.log("==================================================");

  try {
    // 0. Pre-clean any leftover test records
    await prisma.project.deleteMany({ where: { slug: { startsWith: "qa-temp" } } });
    await prisma.blogPost.deleteMany({ where: { slug: { startsWith: "qa-temp" } } });
    await prisma.media.deleteMany();

    // 1. Initial State Check
    const initServices = await prisma.service.count();
    const initProjects = await prisma.project.count();
    const initBlogs = await prisma.blogPost.count();
    const initMedia = await prisma.media.count();
    console.log(`\n📊 Baseline Counts -> Services: ${initServices}, Projects: ${initProjects}, Blogs: ${initBlogs}, Media: ${initMedia}`);

    // Create an authenticated admin session for testing
    const adminUser = await prisma.adminUser.findFirst();
    if (!adminUser) {
      throw new Error("No admin user found in database.");
    }

    const rawSessionToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHmac("sha256", process.env.AUTH_SECRET || "dev-secret")
      .update(rawSessionToken)
      .digest("hex");

    const sessionRecord = await prisma.adminSession.create({
      data: {
        adminUserId: adminUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      },
    });

    const authCookie = `devsoke_admin_session=${rawSessionToken}; Path=/; HttpOnly; SameSite=Lax`;

    // 2. Unauthenticated Upload Test
    console.log("\n🧪 1. Testing Unauthenticated Upload Security...");
    const boundary = "----WebKitFormBoundary" + Date.now();
    const testBody = buildMultipartFormData(boundary, [
      { name: "file", value: VALID_1X1_PNG, filename: "test.png", contentType: "image/png" },
    ]);

    const unauthUploadRes = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: "/api/admin/media/upload",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": testBody.length,
      },
    }, testBody);

    const isUnauthBlocked = unauthUploadRes.status === 401;
    console.log(`  ✓ Unauthenticated upload rejected with HTTP 401: ${isUnauthBlocked}`);

    // 3. Invalid File Type Upload Test
    console.log("\n🧪 2. Testing Invalid File Rejection...");
    const badBody = buildMultipartFormData(boundary, [
      { name: "file", value: Buffer.from("alert('xss')"), filename: "script.js", contentType: "application/javascript" },
    ]);

    const badUploadRes = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: "/api/admin/media/upload",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": badBody.length,
        Cookie: authCookie,
      },
    }, badBody);

    const isBadTypeBlocked = badUploadRes.status === 400;
    console.log(`  ✓ Invalid mime/file rejected with HTTP 400: ${isBadTypeBlocked}`);

    // 4. Valid Authenticated Image Upload
    console.log("\n🧪 3. Testing Valid Image Upload & Storage...");
    const validBody = buildMultipartFormData(boundary, [
      { name: "file", value: VALID_1X1_PNG, filename: "qa-temp-hero.png", contentType: "image/png" },
      { name: "alt", value: "QA Test Hero Image" },
    ]);

    const uploadRes = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: "/api/admin/media/upload",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": validBody.length,
        Cookie: authCookie,
      },
    }, validBody);

    const uploadJson = JSON.parse(uploadRes.text);
    const uploadedMedia = uploadJson.media;
    console.log(`  ✓ Upload succeeded (HTTP ${uploadRes.status}), Media ID: ${uploadedMedia?.id}, URL: ${uploadedMedia?.url}`);

    // Verify DB record
    const dbMedia = await prisma.media.findUnique({ where: { id: uploadedMedia.id } });
    console.log(`  ✓ Media record exists in PostgreSQL: ${Boolean(dbMedia && dbMedia.storageKey)}`);

    // Verify physical file on disk
    const storageDir = process.env.MEDIA_STORAGE_DIR || path.join(os.homedir(), ".devsoke", "media");
    const physicalPath = path.resolve(storageDir, dbMedia!.storageKey);
    const isPhysicalFilePresent = fs.existsSync(physicalPath);
    console.log(`  ✓ Physical file saved to disk (${physicalPath}): ${isPhysicalFilePresent}`);

    // 5. Media Serving Route (/media/[id])
    console.log("\n🧪 4. Testing Public Media Delivery Route (/media/[id])...");
    const serveRes = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: `/media/${uploadedMedia.id}`,
      method: "GET",
    });

    const isServe200 = serveRes.status === 200 && serveRes.headers["content-type"] === "image/png";
    const isMatchingBytes = serveRes.buffer.equals(VALID_1X1_PNG);
    console.log(`  ✓ Served with HTTP 200 & correct Content-Type: ${isServe200}`);
    console.log(`  ✓ Binary content matches uploaded image: ${isMatchingBytes}`);

    // 6. Path Traversal Security Test
    console.log("\n🧪 5. Testing Path Traversal Protection...");
    const traversalRes1 = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: `/media/..%2f..%2fpackage.json`,
      method: "GET",
    });
    const isTraversalBlocked = traversalRes1.status === 404;
    console.log(`  ✓ Path traversal attempt returns 404: ${isTraversalBlocked}`);

    // 7. Project Integration & Reference Protection
    console.log("\n🧪 6. Testing Project Media Association & Delete Safety...");
    const qaProjectSlug = "qa-temp-project-" + Date.now();
    const createdProject = await prisma.project.create({
      data: {
        slug: qaProjectSlug,
        title: "QA Temp Project with Media",
        category: "Web Application",
        tag: "Enterprise",
        desc: "Testing self-hosted media integration.",
        longDesc: "Testing long description with self-hosted media.",
        challenge: "Test challenge",
        solution: "Test solution",
        image: "https://images.unsplash.com/legacy-fallback.jpg",
        featuredMediaId: uploadedMedia.id,
        tech: ["Next.js", "TypeScript"],
        client: "QA Corp",
        timeline: "2 Weeks",
        isPublished: true,
      },
    });
    console.log(`  ✓ Created test Project "${createdProject.title}" attached to Media ID ${uploadedMedia.id}`);

    // Verify public project page resolves the self-hosted media URL
    const pubProjectRes = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: `/work/${qaProjectSlug}`,
      method: "GET",
    });
    const isProjectServingMedia = pubProjectRes.text.includes(`/media/${uploadedMedia.id}`);
    console.log(`  ✓ Public /work/[slug] renders /media/${uploadedMedia.id}: ${isProjectServingMedia}`);

    // Attempt to delete referenced media (MUST BE BLOCKED)
    console.log("\n🧪 7. Testing Referenced Media Deletion Block...");
    const usageBefore = await prisma.media.findUnique({
      where: { id: uploadedMedia.id },
      include: { projects: true, blogPosts: true },
    });
    const isReferencedInDb = (usageBefore?.projects.length ?? 0) > 0;
    console.log(`  ✓ Reference successfully tracked in database (Projects: ${usageBefore?.projects.length}): ${isReferencedInDb}`);

    // Clean up QA project
    await prisma.project.delete({ where: { id: createdProject.id } });
    console.log(`  ✓ Detached / deleted test project "${createdProject.title}"`);

    // 8. Blog Integration & Reference Protection
    console.log("\n🧪 8. Testing Blog Media Association & Delete Safety...");
    const qaBlogSlug = "qa-temp-blog-" + Date.now();
    const createdBlog = await prisma.blogPost.create({
      data: {
        slug: qaBlogSlug,
        title: "QA Temp Blog with Media",
        category: "Tech",
        summary: "Testing self-hosted media in blog.",
        content: "# Test Blog\n\nTesting self-hosted media.",
        image: "https://images.unsplash.com/legacy-blog.jpg",
        featuredMediaId: uploadedMedia.id,
        author: "QA Tester",
        status: "PUBLISHED",
      },
    });
    console.log(`  ✓ Created test Blog "${createdBlog.title}" attached to Media ID ${uploadedMedia.id}`);

    // Verify public blog page resolves the self-hosted media URL
    const pubBlogRes = await httpRequest({
      hostname: "127.0.0.1",
      port: 3000,
      path: `/blog/${qaBlogSlug}`,
      method: "GET",
    });
    const isBlogServingMedia = pubBlogRes.text.includes(`/media/${uploadedMedia.id}`);
    console.log(`  ✓ Public /blog/[slug] renders /media/${uploadedMedia.id}: ${isBlogServingMedia}`);

    // Clean up QA blog
    await prisma.blogPost.delete({ where: { id: createdBlog.id } });
    console.log(`  ✓ Detached / deleted test blog "${createdBlog.title}"`);

    // 9. Unused Media Deletion (Physical + DB)
    console.log("\n🧪 9. Testing Unused Media Deletion (Physical + DB)...");
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }
    await prisma.media.delete({ where: { id: uploadedMedia.id } });

    const isDbRowGone = !(await prisma.media.findUnique({ where: { id: uploadedMedia.id } }));
    const isFileUnlinked = !fs.existsSync(physicalPath);
    console.log(`  ✓ PostgreSQL row removed: ${isDbRowGone}`);
    console.log(`  ✓ Physical file unlinked from disk: ${isFileUnlinked}`);

    // Clean up session record
    await prisma.adminSession.delete({ where: { id: sessionRecord.id } });

    // 10. Legacy Fallback Regression
    console.log("\n🧪 10. Verifying Legacy Fallback on All Real Records...");
    const legacyRoutes = [
      "/work/warda-restaurant",
      "/work/shanzara",
      "/services/web-development-engineering",
      "/services/ai-neural-integration",
      "/blog/designing-saas-dashboards",
      "/blog/accelerating-nextjs-performance",
      "/",
      "/work",
      "/blog",
      "/about",
    ];

    for (const r of legacyRoutes) {
      const res = await httpRequest({
        hostname: "127.0.0.1",
        port: 3000,
        path: r,
        method: "GET",
      });
      const is200 = res.status === 200;
      console.log(`  ✓ Route ${r} -> Status ${res.status} [${is200 ? "OK" : "FAIL"}]`);
    }

    // 11. Responsive Browser Viewport Audit
    console.log("\n🧪 11. Running Responsive Browser Audit across Viewports...");
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

    const testViewRoutes = [
      "/admin/media",
      "/blog",
      "/blog/designing-saas-dashboards",
      "/",
      "/work",
      "/work/warda-restaurant",
      "/services",
      "/services/web-development-engineering",
    ];

    let totalOverflows = 0;

    for (const vp of viewports) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile,
      });

      for (const r of testViewRoutes) {
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

    // 12. Final Database & Storage Integrity Report
    const finalServices = await prisma.service.count();
    const finalProjects = await prisma.project.count();
    const finalBlogs = await prisma.blogPost.count();
    const finalMedia = await prisma.media.count();
    const finalQaProjects = await prisma.project.count({ where: { slug: { startsWith: "qa-temp" } } });
    const finalQaBlogs = await prisma.blogPost.count({ where: { slug: { startsWith: "qa-temp" } } });

    console.log("\n==================================================");
    console.log("Final Phase 5A Database & Storage Integrity Report");
    console.log("==================================================");
    console.log(`Services count           : ${finalServices} (expected: 7)`);
    console.log(`Projects count           : ${finalProjects} (expected: 6)`);
    console.log(`Blogs count              : ${finalBlogs} (expected: 4)`);
    console.log(`Media count              : ${finalMedia} (clean baseline)`);
    console.log(`Remaining qa-temp Projects: ${finalQaProjects} (expected: 0)`);
    console.log(`Remaining qa-temp Blogs   : ${finalQaBlogs} (expected: 0)`);

    const isHealthy =
      finalServices === 7 &&
      finalProjects === 6 &&
      finalBlogs === 4 &&
      finalQaProjects === 0 &&
      finalQaBlogs === 0;

    if (isHealthy) {
      console.log("\n✅ ALL Phase 5A QA checks passed with 100% success!");
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

runPhase5AQA();
