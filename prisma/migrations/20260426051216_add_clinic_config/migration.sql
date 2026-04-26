-- CreateTable
CREATE TABLE "ClinicConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ClinicConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClinicConfig_key_key" ON "ClinicConfig"("key");

-- CreateIndex
CREATE INDEX "ClinicConfig_key_idx" ON "ClinicConfig"("key");
