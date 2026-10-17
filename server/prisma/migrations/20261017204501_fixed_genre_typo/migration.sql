/*
  Warnings:

  - You are about to drop the column `generated` on the `Artwork` table. All the data in the column will be lost.
  - Added the required column `genre` to the `Artwork` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artwork" DROP COLUMN "generated",
ADD COLUMN     "genre" TEXT NOT NULL;
