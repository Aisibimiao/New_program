-- AlterTable
ALTER TABLE `user` ADD COLUMN `openid` VARCHAR(191) NULL;
ALTER TABLE `user` ADD UNIQUE INDEX `user_openid_key`(`openid`);