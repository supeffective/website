-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255),
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "isDisabled" BOOLEAN DEFAULT false,
    "userName" TEXT,
    "displayName" TEXT,
    "roles" JSONB,
    "adminRoles" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(50) NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" VARCHAR(50) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirebaseAccount" (
    "id" VARCHAR(50) NOT NULL,
    "userId" VARCHAR(50),
    "email" VARCHAR(255),
    "emailVerified" BOOLEAN,
    "displayName" TEXT,
    "photoUrl" TEXT,
    "providerId" TEXT,
    "creationTime" TIMESTAMP(3),
    "lastSignInTime" TIMESTAMP(3),
    "lastRefreshTime" TIMESTAMP(3),

    CONSTRAINT "FirebaseAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" VARCHAR(50) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivingDex" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(50),
    "firebaseAccountId" VARCHAR(50),
    "schemaVer" INTEGER,
    "title" VARCHAR(255),
    "gameId" VARCHAR(50),
    "data" JSONB NOT NULL,
    "creationTime" TIMESTAMP(3) NOT NULL,
    "lastUpdateTime" TIMESTAMP(3),

    CONSTRAINT "LivingDex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "FirebaseAccount_email_idx" ON "FirebaseAccount"("email");

-- CreateIndex
CREATE INDEX "FirebaseAccount_userId_idx" ON "FirebaseAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "LivingDex_userId_idx" ON "LivingDex"("userId");

-- CreateIndex
CREATE INDEX "LivingDex_firebaseAccountId_idx" ON "LivingDex"("firebaseAccountId");

-- CreateIndex
CREATE INDEX "LivingDex_lastUpdateTime_idx" ON "LivingDex"("lastUpdateTime");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirebaseAccount" ADD CONSTRAINT "FirebaseAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivingDex" ADD CONSTRAINT "LivingDex_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivingDex" ADD CONSTRAINT "LivingDex_firebaseAccountId_fkey" FOREIGN KEY ("firebaseAccountId") REFERENCES "FirebaseAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
