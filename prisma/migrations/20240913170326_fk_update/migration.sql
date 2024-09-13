/*
  Warnings:

  - You are about to drop the column `isBookmarked` on the `Story` table. All the data in the column will be lost.
  - You are about to drop the column `storyId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_storyId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_storyId_fkey";

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "isBookmarked";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "storyId",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("storyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("storyId") ON DELETE CASCADE ON UPDATE CASCADE;
