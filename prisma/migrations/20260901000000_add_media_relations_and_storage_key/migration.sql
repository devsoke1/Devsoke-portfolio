-- AlterTable
ALTER TABLE "Project" ADD COLUMN "featuredMediaId" TEXT;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "featuredMediaId" TEXT;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN IF EXISTS "filename",
DROP COLUMN IF EXISTS "url",
DROP COLUMN IF EXISTS "altText",
ADD COLUMN "storageKey" TEXT NOT NULL,
ADD COLUMN "originalFilename" TEXT NOT NULL,
ADD COLUMN "alt" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Media_storageKey_key" ON "Media"("storageKey");

-- CreateIndex
CREATE INDEX "Media_storageKey_idx" ON "Media"("storageKey");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "Project_featuredMediaId_idx" ON "Project"("featuredMediaId");

-- CreateIndex
CREATE INDEX "BlogPost_featuredMediaId_idx" ON "BlogPost"("featuredMediaId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_featuredMediaId_fkey" FOREIGN KEY ("featuredMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_featuredMediaId_fkey" FOREIGN KEY ("featuredMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

