import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('MAIL_HOST'),
      port: configService.get<number>('MAIL_PORT'),
      auth: {
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASS'),
      },
    });
  }

  async sendOrderConfirmation(order: Order) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: order.email,
        subject: `Order Confirmed - ${order.orderNumber} | Complementary Fashions 🧶`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #faf8f5; padding: 40px; border-radius: 12px;">
            <h1 style="color: #8b5e3c; font-size: 28px;">Thank you, ${order.fullName}! 🧶</h1>
            <p style="color: #5a3e2b;">Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
            
            <div style="background: white; border-radius: 8px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #8b5e3c; margin-top: 0;">Order Summary</h3>
              ${order.items?.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0e8df;">
                  <span>${item.productName} ${item.size ? `(${item.size})` : ''} × ${item.quantity}</span>
                  <span>KES ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div style="padding-top: 12px;">
                <div style="display: flex; justify-content: space-between;"><span>Delivery</span><span>KES ${order.deliveryFee}</span></div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 8px; color: #8b5e3c;">
                  <span>Total</span><span>KES ${order.total}</span>
                </div>
              </div>
            </div>

            <p style="color: #5a3e2b;"><strong>Delivery to:</strong> ${order.deliveryLocation}</p>
            <p style="color: #888; font-size: 13px;">If you have questions, contact us at hello@complementaryfashions.com</p>
            
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8ddd5;">
              <p style="color: #c8956c; font-style: italic;">Handcrafted with love 🌿</p>
              <p style="color: #888; font-size: 12px;">© Complementary Fashions</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send order confirmation email', error);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: 'Welcome to Complementary Fashions 🧶',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; padding: 40px; background: #faf8f5; border-radius: 12px;">
            <h1 style="color: #8b5e3c;">Welcome, ${firstName}! 🧶</h1>
            <p style="color: #5a3e2b;">We're thrilled to have you join the Complementary Fashions family.</p>
            <p style="color: #5a3e2b;">Explore our handcrafted crochet collection and find your perfect piece.</p>
            <a href="${this.configService.get('PUBLIC_FRONTEND_URL')}" 
               style="background: #c8956c; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; display: inline-block; margin-top: 20px;">
              Shop Now
            </a>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }
  }
}
