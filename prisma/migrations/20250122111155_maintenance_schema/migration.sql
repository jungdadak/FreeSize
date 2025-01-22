/*
  Warnings:

  - Changed the type of `type` on the `MaintenanceBanner` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('destructive', 'warning', 'info', 'maintenance');

-- AlterTable
ALTER TABLE "MaintenanceBanner" ALTER COLUMN "id" SET DEFAULT 1,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "isActive" DROP DEFAULT,
DROP COLUMN "type",
ADD COLUMN     "type" "MaintenanceType" NOT NULL;
DROP SEQUENCE "MaintenanceBanner_id_seq";
