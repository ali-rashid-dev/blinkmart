CREATE TABLE "newsletter_subscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_subscription_email_key" ON "newsletter_subscription"("email");