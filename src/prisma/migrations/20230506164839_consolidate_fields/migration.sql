/*
  Warnings:

  - You are about to drop the column `mdData` on the `LivingDex` table. All the data in the column will be lost.
  - You are about to drop the column `schemaVer` on the `LivingDex` table. All the data in the column will be lost.
  - You are about to drop the column `adminRoles` on the `User` table. All the data in the column will be lost.
  - Made the column `userId` on table `FirebaseAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `LivingDex` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gameId` on table `LivingDex` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastUpdateTime` on table `LivingDex` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDisabled` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FirebaseAccount" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LivingDex" DROP COLUMN "mdData",
DROP COLUMN "schemaVer",
ADD COLUMN     "specVer" VARCHAR(10) NOT NULL DEFAULT 'v4',
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "gameId" SET NOT NULL,
ALTER COLUMN "data" SET DATA TYPE TEXT,
ALTER COLUMN "lastUpdateTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminRoles",
ALTER COLUMN "isDisabled" SET NOT NULL;
