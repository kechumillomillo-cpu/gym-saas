import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PushProvider {
  private readonly logger = new Logger(PushProvider.name)
  private messaging: any = null

  constructor(private config: ConfigService) {
    this.initFirebase()
  }

  private async initFirebase() {
    const projectId = this.config.get('FIREBASE_PROJECT_ID')
    const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL')
    const privateKey = this.config.get('FIREBASE_PRIVATE_KEY')

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase not configured — push notifications disabled')
      return
    }

    try {
      const admin = await import('firebase-admin')
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        })
      }
      this.messaging = admin.messaging()
      this.logger.log('Firebase initialized')
    } catch (e) {
      this.logger.error('Firebase init failed', e)
    }
  }

  async send(token: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> {
    if (!this.messaging) return false
    try {
      await this.messaging.send({
        token,
        notification: { title, body },
        data: data || {},
        android: { priority: 'high', notification: { channelId: 'gym_saas' } },
        apns: { payload: { aps: { badge: 1, sound: 'default' } } },
      })
      return true
    } catch (e) {
      this.logger.error(`Push failed for token ${token.substring(0, 10)}...`, e)
      return false
    }
  }

  async sendToTopic(topic: string, title: string, body: string): Promise<boolean> {
    if (!this.messaging) return false
    try {
      await this.messaging.send({
        topic,
        notification: { title, body },
      })
      return true
    } catch (e) {
      this.logger.error('Topic push failed', e)
      return false
    }
  }
}
