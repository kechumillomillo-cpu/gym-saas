import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class WhatsappProvider {
  private readonly logger = new Logger(WhatsappProvider.name)

  constructor(private config: ConfigService) {}

  async send(phone: string, message: string): Promise<boolean> {
    const apiUrl = this.config.get('EVOLUTION_API_URL')
    const apiKey = this.config.get('EVOLUTION_API_KEY')
    const instance = this.config.get('EVOLUTION_INSTANCE')

    if (!apiUrl || !apiKey) {
      this.logger.warn('WhatsApp not configured — skipping send')
      return false
    }

    const cleanPhone = phone.replace(/\D/g, '')

    try {
      const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({
          number: `${cleanPhone}@s.whatsapp.net`,
          textMessage: { text: message },
        }),
      })
      if (!response.ok) throw new Error(await response.text())
      this.logger.log(`WhatsApp sent to ${cleanPhone}`)
      return true
    } catch (err) {
      this.logger.error(`WhatsApp failed for ${cleanPhone}`, err)
      return false
    }
  }

  paymentDueMessage(memberName: string, daysLeft: number, amount: number, gymName: string) {
    const urgency = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟡' : '🟢'
    return `${urgency} Hola ${memberName}! Te recordamos desde *${gymName}* que tu cuota de *$${amount.toLocaleString('es-AR')}* vence en *${daysLeft} día${daysLeft !== 1 ? 's' : ''}*. ¡No te quedes sin acceso! 💪`
  }

  routineExpiringMessage(memberName: string, routineName: string, daysLeft: number, gymName: string) {
    return `💪 Hola ${memberName}! Tu rutina *"${routineName}"* en *${gymName}* vence en ${daysLeft} días. Hablá con tu entrenador para renovarla.`
  }

  welcomeMessage(memberName: string, gymName: string) {
    return `🎉 Bienvenido a *${gymName}*, *${memberName}*! Ya sos parte de nuestra familia. Podés ver tu rutina y horarios desde la app. ¡Mucho éxito! 💪`
  }
}
