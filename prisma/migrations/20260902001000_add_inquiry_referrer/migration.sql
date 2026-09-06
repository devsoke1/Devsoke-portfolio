-- Store browser referrer when safely available so lead source review can
-- separate on-site CTA context from off-site referral context.
ALTER TABLE "Booking" ADD COLUMN "referrer" TEXT;

CREATE INDEX "Booking_referrer_idx" ON "Booking"("referrer");
