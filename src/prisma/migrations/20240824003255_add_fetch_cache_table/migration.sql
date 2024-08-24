/*
  Warnings:

  - You are about to drop the column `firebaseAccountId` on the `LivingDex` table. All the data in the column will be lost.
  - You are about to drop the `FirebaseAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FirebaseAccount" DROP CONSTRAINT "FirebaseAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "LivingDex" DROP CONSTRAINT "LivingDex_firebaseAccountId_fkey";

-- AlterTable
ALTER TABLE "LivingDex" DROP COLUMN "firebaseAccountId";

-- DropTable
DROP TABLE "FirebaseAccount";

-- CreateTable
CREATE TABLE "FetchCache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FetchCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FetchCache_key_key" ON "FetchCache"("key");
