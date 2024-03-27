/*
  Warnings:

  - You are about to drop the `PatreonMembership` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PatreonMembership" DROP CONSTRAINT "PatreonMembership_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discordUsername" VARCHAR(40),
ADD COLUMN     "twitchUsername" VARCHAR(40),
ADD COLUMN     "twitterUsername" VARCHAR(20);

-- DropTable
DROP TABLE "PatreonMembership";

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "patreonCampaignId" TEXT NOT NULL,
    "patreonUserId" TEXT,
    "patreonMemberId" TEXT,
    "patronStatus" TEXT,
    "currentTier" TEXT NOT NULL,
    "highestTier" TEXT NOT NULL,
    "totalContributed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardMaxDexes" INTEGER NOT NULL DEFAULT 50,
    "rewardFeaturedStreamer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_patreonCampaignId_key" ON "Membership"("userId", "patreonCampaignId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
