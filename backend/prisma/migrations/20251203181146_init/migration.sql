-- CreateTable
CREATE TABLE "Vendor" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Rfp" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" REAL,
    "currency" TEXT DEFAULT 'USD',
    "deliveryWindow" TEXT,
    "paymentTerms" TEXT,
    "warranty" TEXT,
    "rawPrompt" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft'
);

-- CreateTable
CREATE TABLE "RfpLineItem" (
    "id" SERIAL PRIMARY KEY,
    "rfpId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "specs" TEXT,
    CONSTRAINT "RfpLineItem_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" SERIAL PRIMARY KEY,
    "rfpId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "emailMessageId" TEXT,
    "rawEmail" TEXT NOT NULL,
    "parsedJson" TEXT NOT NULL,
    "totalPrice" REAL,
    "currency" TEXT DEFAULT 'USD',
    "deliveryDays" INTEGER,
    "score" REAL,
    "aiSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proposal_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proposal_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_emailMessageId_key" ON "Proposal"("emailMessageId");
