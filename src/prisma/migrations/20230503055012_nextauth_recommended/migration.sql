/*
  Warnings:

  - The primary key for the `FirebaseAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `userName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `displayName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - A unique constraint covering the columns `[userName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "FirebaseAccount" DROP CONSTRAINT "FirebaseAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "LivingDex" DROP CONSTRAINT "LivingDex_firebaseAccountId_fkey";

-- DropForeignKey
ALTER TABLE "LivingDex" DROP CONSTRAINT "LivingDex_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Account_userId_idx";

-- DropIndex
DROP INDEX "FirebaseAccount_userId_idx";

-- DropIndex
DROP INDEX "LivingDex_firebaseAccountId_idx";

-- DropIndex
DROP INDEX "LivingDex_lastUpdateTime_idx";

-- DropIndex
DROP INDEX "LivingDex_userId_idx";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "providerAccountId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "FirebaseAccount" DROP CONSTRAINT "FirebaseAccount_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ADD CONSTRAINT "FirebaseAccount_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LivingDex" ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "firebaseAccountId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "userName" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "displayName" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "VerificationToken" ALTER COLUMN "token" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirebaseAccount" ADD CONSTRAINT "FirebaseAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivingDex" ADD CONSTRAINT "LivingDex_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivingDex" ADD CONSTRAINT "LivingDex_firebaseAccountId_fkey" FOREIGN KEY ("firebaseAccountId") REFERENCES "FirebaseAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
