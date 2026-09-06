-- CreateEnum
CREATE TYPE "InquirySource" AS ENUM ('BOOKING_MODAL', 'CONTACT_PAGE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "company" TEXT,
ADD COLUMN "source" "InquirySource" NOT NULL DEFAULT 'BOOKING_MODAL',
ADD COLUMN "ipHash" TEXT;

-- CreateIndex
CREATE INDEX "Booking_source_idx" ON "Booking"("source");

