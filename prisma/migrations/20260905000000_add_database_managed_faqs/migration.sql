-- CreateEnum
CREATE TYPE "FaqPlacement" AS ENUM ('HOME', 'ABOUT', 'SERVICES_INDEX', 'SERVICE_DETAIL', 'CONTACT');

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "placement" "FaqPlacement" NOT NULL,
    "serviceId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Faq_key_key" ON "Faq"("key");

-- CreateIndex
CREATE INDEX "Faq_placement_isPublished_order_idx" ON "Faq"("placement", "isPublished", "order");

-- CreateIndex
CREATE INDEX "Faq_serviceId_idx" ON "Faq"("serviceId");

-- CreateIndex
CREATE INDEX "Faq_isPublished_idx" ON "Faq"("isPublished");

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
