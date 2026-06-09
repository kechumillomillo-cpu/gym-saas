import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { EmailProvider } from './providers/email.provider'
import { WhatsappProvider } from './providers/whatsapp.provider'
import { PushProvider } from './providers/push.provider'

@Module({
  providers: [NotificationsService, EmailProvider, WhatsappProvider, PushProvider],
  controllers: [NotificationsController],
  exports: [NotificationsService, PushProvider],
})
export class NotificationsModule {}
