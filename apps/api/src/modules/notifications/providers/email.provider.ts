import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name)
  private transporter: nodemailer.Transporter

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: Number(config.get('SMTP_PORT') || 465),
      secure: Number(config.get('SMTP_PORT')) === 465,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    })
  }

  async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM') || 'GymSaaS <noreply@gymsaas.app>',
        to,
        subject,
        html,
      })
      this.logger.log(`Email sent to ${to}: ${subject}`)
      return true
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err)
      return false
    }
  }

  buildPaymentDueEmail(memberName: string, daysLeft: number, amount: number, gymName: string) {
    const urgency = daysLeft <= 1 ? '🔴 URGENTE' : daysLeft <= 3 ? '🟡' : '🟢'
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a1a2e;padding:20px;text-align:center">
          <h1 style="color:#e94560;margin:0">${gymName}</h1>
        </div>
        <div style="padding:30px">
          <h2>${urgency} Recordatorio de pago</h2>
          <p>Hola <strong>${memberName}</strong>,</p>
          <p>Tu cuota de <strong>$${amount.toLocaleString('es-AR')}</strong> vence en <strong>${daysLeft} día${daysLeft !== 1 ? 's' : ''}</strong>.</p>
          <p>Recordá abonarla para continuar disfrutando de todas las instalaciones.</p>
          <p style="color:#666;font-size:12px">Este es un mensaje automático de ${gymName}.</p>
        </div>
      </div>`
  }

  buildWelcomeEmail(memberName: string, gymName: string, loginUrl: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a1a2e;padding:20px;text-align:center">
          <h1 style="color:#e94560;margin:0">${gymName}</h1>
        </div>
        <div style="padding:30px">
          <h2>¡Bienvenido a ${gymName}! 💪</h2>
          <p>Hola <strong>${memberName}</strong>, ya sos parte de nuestra familia.</p>
          <p>Podés ver tu rutina, horarios y pagos desde la app:</p>
          <a href="${loginUrl}" style="background:#e94560;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">Acceder a mi cuenta</a>
        </div>
      </div>`
  }
}
