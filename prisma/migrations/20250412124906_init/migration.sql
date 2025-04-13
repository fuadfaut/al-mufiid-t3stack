-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SANTRI',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nis" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "jilid" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surah" TEXT,
    "jilid" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "finalScore" REAL,
    CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FashahahAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "makharijulHuruf" REAL NOT NULL,
    "sifatulHuruf" REAL NOT NULL,
    "harakat" REAL NOT NULL,
    "madQashr" REAL NOT NULL,
    "score" REAL NOT NULL,
    "assessmentId" TEXT NOT NULL,
    CONSTRAINT "FashahahAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TajwidAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hukumNunMati" REAL NOT NULL,
    "hukumMimMati" REAL NOT NULL,
    "mad" REAL NOT NULL,
    "waqafIbtida" REAL NOT NULL,
    "tafkhimTarqiq" REAL NOT NULL,
    "score" REAL NOT NULL,
    "assessmentId" TEXT NOT NULL,
    CONSTRAINT "TajwidAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TartilAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tempo" REAL NOT NULL,
    "calmness" REAL NOT NULL,
    "fluency" REAL NOT NULL,
    "score" REAL NOT NULL,
    "assessmentId" TEXT NOT NULL,
    CONSTRAINT "TartilAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdabAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attitude" REAL NOT NULL,
    "score" REAL NOT NULL,
    "assessmentId" TEXT NOT NULL,
    CONSTRAINT "AdabAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voice" REAL NOT NULL,
    "tone" REAL NOT NULL,
    "score" REAL NOT NULL,
    "assessmentId" TEXT NOT NULL,
    CONSTRAINT "VoiceAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Student_nis_key" ON "Student"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FashahahAssessment_assessmentId_key" ON "FashahahAssessment"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TajwidAssessment_assessmentId_key" ON "TajwidAssessment"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "TartilAssessment_assessmentId_key" ON "TartilAssessment"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdabAssessment_assessmentId_key" ON "AdabAssessment"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceAssessment_assessmentId_key" ON "VoiceAssessment"("assessmentId");
