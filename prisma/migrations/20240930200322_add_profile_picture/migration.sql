-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicture" TEXT,
ALTER COLUMN "joinedOn" DROP DEFAULT;
