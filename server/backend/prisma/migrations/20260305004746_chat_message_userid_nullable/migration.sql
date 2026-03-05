-- DropForeignKey
ALTER TABLE `answer` DROP FOREIGN KEY `answer_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `chat_message` DROP FOREIGN KEY `chat_message_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `notification_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `sushi` DROP FOREIGN KEY `sushi_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `sushi_exposure` DROP FOREIGN KEY `sushi_exposure_user_id_fkey`;

-- AlterTable
ALTER TABLE `chat_message` ADD COLUMN `sushi_id` INTEGER NULL,
    ADD COLUMN `type` VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    MODIFY `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sushi` ADD CONSTRAINT `sushi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer` ADD CONSTRAINT `answer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sushi_exposure` ADD CONSTRAINT `sushi_exposure_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_message` ADD CONSTRAINT `chat_message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_message` ADD CONSTRAINT `chat_message_sushi_id_fkey` FOREIGN KEY (`sushi_id`) REFERENCES `sushi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
