-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'patreon';
