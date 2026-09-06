-- Add nullable attribution fields for lead-source analysis without requiring
-- historical inquiry records to be backfilled.
ALTER TABLE "Booking"
ADD COLUMN "projectContext" TEXT,
ADD COLUMN "entryPath" TEXT,
ADD COLUMN "ctaLabel" TEXT,
ADD COLUMN "ctaLocation" TEXT,
ADD COLUMN "submissionToken" TEXT;

CREATE UNIQUE INDEX "Booking_submissionToken_key" ON "Booking"("submissionToken");
CREATE INDEX "Booking_entryPath_idx" ON "Booking"("entryPath");
CREATE INDEX "Booking_ctaLocation_idx" ON "Booking"("ctaLocation");
