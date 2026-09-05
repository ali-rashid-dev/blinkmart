-- CreateEnum
CREATE TYPE "NewsletterSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "newsletter_subscription"
ADD COLUMN "status" "NewsletterSubscriptionStatus" NOT NULL DEFAULT 'PENDING';