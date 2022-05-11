/*
  Warnings:

  - Changed the type of `damage` on the `guns` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "guns" DROP COLUMN "damage",
ADD COLUMN     "damage" INTEGER NOT NULL;
