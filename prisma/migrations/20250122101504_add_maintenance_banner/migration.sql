-- CreateTable
CREATE TABLE "MaintenanceBanner" (
    "id" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceBanner_pkey" PRIMARY KEY ("id")
);
