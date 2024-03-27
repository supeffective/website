-- CreateTable
CREATE TABLE "PatreonMembership" (
    "id" TEXT NOT NULL,
    "patreonCampaignId" TEXT NOT NULL,
    "patreonUserId" TEXT NOT NULL,
    "patreonMemberId" TEXT NOT NULL,
    "currentTier" TEXT NOT NULL,
    "highestTier" TEXT NOT NULL,
    "patronStatus" TEXT NOT NULL,
    "totalContributed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastChargedAt" TIMESTAMP(3),
    "lastChargeStatus" TEXT,
    "userId" TEXT,

    CONSTRAINT "PatreonMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatreonMembership_userId_key" ON "PatreonMembership"("userId");

-- AddForeignKey
ALTER TABLE "PatreonMembership" ADD CONSTRAINT "PatreonMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
