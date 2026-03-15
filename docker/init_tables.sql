CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE "Role" AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE "OfferStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'interview', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE "ParseStatus" AS ENUM ('pending', 'processing', 'done', 'failed');
CREATE TYPE "ImportedFrom" AS ENUM ('upload', 'json', 'github');

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isBanned" BOOLEAN NOT NULL DEFAULT false,
  "location" TEXT,
  "availabilityMonths" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tokenHash" TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "schools" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "country" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "companies" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "industry" TEXT,
  "siteWeb" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isRejected" BOOLEAN NOT NULL DEFAULT false,
  "rejectedReason" TEXT,
  "validatedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "companyId" TEXT REFERENCES "companies"("id") ON DELETE SET NULL,
  "schoolId" TEXT REFERENCES "schools"("id") ON DELETE SET NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "bio" TEXT,
  "linkedinUrl" TEXT,
  "githubUsername" TEXT,
  "githubData" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "skills" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "category" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "cv_documents" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "fileUrl" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "embedding" vector(384),
  "importedFrom" "ImportedFrom" NOT NULL DEFAULT 'upload',
  "parseStatus" "ParseStatus" NOT NULL DEFAULT 'pending',
  "parsedText" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "lastAttemptAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "extracted_skills" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "cvDocumentId" TEXT NOT NULL REFERENCES "cv_documents"("id") ON DELETE CASCADE,
  "skillId" TEXT NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "confidence" FLOAT,
  UNIQUE("cvDocumentId", "skillId")
);

CREATE TABLE IF NOT EXISTS "job_offers" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "recruiterId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT,
  "durationMonths" INTEGER,
  "remote" BOOLEAN NOT NULL DEFAULT false,
  "offerStatus" "OfferStatus" NOT NULL DEFAULT 'draft',
  "embedding" vector(384),
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "offer_skills" (
  "offerId" TEXT NOT NULL REFERENCES "job_offers"("id") ON DELETE CASCADE,
  "skillId" TEXT NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "isRequired" BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY ("offerId", "skillId")
);

CREATE TABLE IF NOT EXISTS "match_scores" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "candidateId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "offerId" TEXT NOT NULL REFERENCES "job_offers"("id") ON DELETE CASCADE,
  "cvDocumentId" TEXT NOT NULL REFERENCES "cv_documents"("id") ON DELETE CASCADE,
  "scoreCosinus" FLOAT NOT NULL,
  "scoreFinal" FLOAT NOT NULL,
  "breakdown" JSONB NOT NULL,
  "computedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("candidateId", "offerId")
);

CREATE TABLE IF NOT EXISTS "applications" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "candidateId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "offerId" TEXT NOT NULL REFERENCES "job_offers"("id") ON DELETE CASCADE,
  "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'pending',
  "coverLetter" TEXT,
  "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("candidateId", "offerId")
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "senderId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "receiverId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "applicationId" TEXT REFERENCES "applications"("id") ON DELETE SET NULL,
  "content" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "actorId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_embedding ON cv_documents USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_offer_embedding ON job_offers USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications ("userId", "isRead") WHERE "isRead" = false;
CREATE INDEX IF NOT EXISTS idx_cv_active ON cv_documents ("userId") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_offers_status ON job_offers ("offerStatus");
CREATE INDEX IF NOT EXISTS idx_applications_composite ON applications ("offerId", "applicationStatus");
CREATE INDEX IF NOT EXISTS idx_match_offer_score ON match_scores ("offerId", "scoreFinal" DESC);