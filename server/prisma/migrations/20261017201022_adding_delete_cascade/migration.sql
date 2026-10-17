-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_artworkId_fkey";

-- DropForeignKey
ALTER TABLE "CritiqueSummary" DROP CONSTRAINT "CritiqueSummary_artworkId_fkey";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CritiqueSummary" ADD CONSTRAINT "CritiqueSummary_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
