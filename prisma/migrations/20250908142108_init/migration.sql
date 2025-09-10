-- CreateEnum
CREATE TYPE "public"."FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."Friendship" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" "public"."FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_senderId_receiverId_key" ON "public"."Friendship"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
