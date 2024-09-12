-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_storyId_fkey";

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("storyId") ON DELETE CASCADE ON UPDATE CASCADE;
