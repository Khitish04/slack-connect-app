/*
  Warnings:

  - A unique constraint covering the columns `[userId,teamId]` on the table `SlackToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SlackToken_userId_teamId_key" ON "SlackToken"("userId", "teamId");
