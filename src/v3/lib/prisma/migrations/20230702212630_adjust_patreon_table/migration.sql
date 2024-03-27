/*
  Warnings:

  - You are about to drop the column `lastChargeStatus` on the `PatreonMembership` table. All the data in the column will be lost.
  - You are about to drop the column `lastChargedAt` on the `PatreonMembership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,patreonCampaignId]` on the table `PatreonMembership` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `PatreonMembership` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PatreonMembership" DROP CONSTRAINT "PatreonMembership_userId_fkey";

-- DropIndex
DROP INDEX "PatreonMembership_userId_key";

-- AlterTable
ALTER TABLE "PatreonMembership" DROP COLUMN "lastChargeStatus",
DROP COLUMN "lastChargedAt",
ADD COLUMN     "rewardFeaturedStreamer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rewardMaxDexes" INTEGER NOT NULL DEFAULT 50,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PatreonMembership_userId_patreonCampaignId_key" ON "PatreonMembership"("userId", "patreonCampaignId");

-- AddForeignKey
ALTER TABLE "PatreonMembership" ADD CONSTRAINT "PatreonMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
