import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { EmailProvider } from './providers/email.provider'
import { WhatsappProvider } from './providers/whatsapp.provider'

@Module({
  providers: [NotificationsService, EmailProvider, WhatsappProvider],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
