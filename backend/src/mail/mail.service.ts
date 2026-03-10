import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("MAIL_HOST", "smtp.gmail.com"),
      port: this.configService.get<number>("MAIL_PORT", 587),
      secure: false,
      auth: {
        user: this.configService.get("MAIL_USER"),
        pass: this.configService.get("MAIL_PASS"),
      },
    });
  }

  private get fromAddress() {
    return `Complementary Fashions <${this.configService.get("MAIL_USER")}>`;
  }

  private get storeUrl() {
    return this.configService.get("FRONTEND_URL", "http://localhost:4200");
  }

  private get adminUrl() {
    return this.configService.get("ADMIN_URL", "http://localhost:4201");
  }

  private baseTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:Georgia,serif;">
        <div style="max-width:620px;margin:32px auto;background:#faf8f5;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#8b6f47,#c8956c);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:white;font-size:26px;font-style:italic;letter-spacing:1px;">🧶 Complementary Fashions</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Handcrafted with Love</p>
          </div>
          <div style="padding:40px;">
            ${content}
          </div>
          <div style="background:#f0e8df;padding:24px 40px;text-align:center;border-top:1px solid #e8ddd5;">
            <p style="margin:0;color:#c8956c;font-style:italic;font-size:14px;">Every piece tells a story 🌿</p>
            <p style="margin:8px 0 0;color:#a08060;font-size:12px;">© ${new Date().getFullYear()} Complementary Fashions. All rights reserved.</p>
            <p style="margin:4px 0 0;"><a href="${this.storeUrl}" style="color:#8b6f47;font-size:12px;text-decoration:none;">Visit our store →</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private paymentMethodText(method: string): string {
    const map: any = {
      stk: "M-Pesa STK Push",
      paybill: "M-Pesa Paybill",
      till: "M-Pesa Till Number",
      send: "M-Pesa Send Money",
      cod: "Pay on Delivery (Cash)",
      later: "Pay Later",
    };
    return map[method] || method || "N/A";
  }

  // ─── Order Confirmation to Customer ───────────────────────────────────────
  async sendOrderConfirmation(order: any): Promise<void> {
    try {
      const isCod = order.selectedPaymentMethod === "cod";
      const isLater = order.selectedPaymentMethod === "later";

      const itemsHtml = (order.items || [])
        .map(
          (item: any) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8df;">
            <span style="font-weight:600;color:#3d2b1f;">${item.productName}</span>
            ${item.selectedSize ? `<span style="font-size:12px;color:#a08060;margin-left:6px;">(${item.selectedSize})</span>` : ""}
            ${item.selectedColor ? `<span style="font-size:12px;color:#a08060;margin-left:4px;">· ${item.selectedColor}</span>` : ""}
            <br><span style="font-size:13px;color:#a08060;">Qty: ${item.quantity} × KSh ${Number(item.unitPrice).toLocaleString()}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0e8df;text-align:right;font-weight:600;color:#8b6f47;">
            KSh ${Number(item.totalPrice).toLocaleString()}
          </td>
        </tr>
      `,
        )
        .join("");

      const paymentNote = isCod
        ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin:20px 0;">
            <strong style="color:#92400e;">🚚 Pay on Delivery</strong>
            <p style="margin:6px 0 0;color:#92400e;font-size:13px;">Please have the exact amount ready when your order arrives.</p>
           </div>`
        : isLater
          ? `<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:14px 16px;margin:20px 0;">
            <strong style="color:#5b21b6;">⏳ Pay Later</strong>
            <p style="margin:6px 0 0;color:#5b21b6;font-size:13px;">We'll reach out to arrange payment before shipping your order.</p>
           </div>`
          : `<div style="background:#d1fae5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 16px;margin:20px 0;">
            <strong style="color:#065f46;">✅ Payment Received</strong>
            <p style="margin:6px 0 0;color:#065f46;font-size:13px;">Your payment via ${this.paymentMethodText(order.selectedPaymentMethod)} has been confirmed.</p>
           </div>`;

      const content = `
        <h2 style="margin:0 0 6px;color:#3d2b1f;font-size:22px;">Thank you, ${order.orderType === "pos" ? order.posCustomerName || "valued customer" : order.deliveryFullName}! 🎉</h2>
        <p style="margin:0 0 24px;color:#7a5c44;font-size:15px;">${order.orderType === "pos" ? "Here is your receipt for your in-store purchase." : "Your order has been placed successfully."}</p>
        <div style="background:#f0e8df;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#8b6f47;font-family:monospace;">${order.orderNumber}</p>
        </div>
        ${paymentNote}
        <h3 style="color:#3d2b1f;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding:10px 0;color:#7a5c44;">Subtotal</td>
            <td style="padding:10px 0;text-align:right;color:#7a5c44;">KSh ${Number(order.subtotal).toLocaleString()}</td>
          </tr>
          ${
            Number(order.discountAmount) > 0
              ? `<tr>
            <td style="padding:6px 0;color:#e05252;">Discount</td>
            <td style="padding:6px 0;text-align:right;color:#e05252;">-KSh ${Number(order.discountAmount).toLocaleString()}</td>
          </tr>`
              : ""
          }
          ${
            Number(order.taxAmount) > 0
              ? `<tr>
            <td style="padding:6px 0;color:#7a5c44;">Tax</td>
            <td style="padding:6px 0;text-align:right;color:#7a5c44;">KSh ${Number(order.taxAmount).toLocaleString()}</td>
          </tr>`
              : ""
          }
          ${
            order.orderType !== "pos" && Number(order.deliveryFee) > 0
              ? `<tr>
            <td style="padding:6px 0;color:#7a5c44;">Delivery Fee</td>
            <td style="padding:6px 0;text-align:right;color:#7a5c44;">KSh ${Number(order.deliveryFee).toLocaleString()}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:12px 0 0;font-size:18px;font-weight:700;color:#8b6f47;border-top:2px solid #e8ddd5;">Total</td>
            <td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:700;color:#8b6f47;border-top:2px solid #e8ddd5;">KSh ${Number(order.totalAmount).toLocaleString()}</td>
          </tr>
        </table>
        ${
          order.orderType === "pos"
            ? `
        <div style="margin-top:20px;background:#f0e8df;border-radius:8px;padding:14px 16px;">
          <p style="margin:0;font-size:13px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">In-Store Purchase</p>
          <p style="margin:6px 0 0;color:#5a3e2b;">📍 <strong>Complementary Fashions</strong> — In-Store Sale</p>
          <p style="margin:4px 0;color:#7a5c44;">Staff: ${order.processedByName}</p>
          ${order.notes ? `<p style="margin:6px 0 0;color:#a08060;font-style:italic;font-size:13px;">Note: ${order.notes}</p>` : ""}
        </div>`
            : `
        <div style="margin-top:28px;padding-top:24px;border-top:1px solid #e8ddd5;">
          <h3 style="color:#3d2b1f;font-size:15px;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px;">Delivery Details</h3>
          <p style="margin:4px 0;color:#5a3e2b;"><strong>${order.deliveryFullName}</strong></p>
          <p style="margin:4px 0;color:#7a5c44;">${order.deliveryAddress}${order.deliveryCity ? ", " + order.deliveryCity : ""}</p>
          <p style="margin:4px 0;color:#7a5c44;">📞 ${order.deliveryPhone}</p>
          ${order.notes ? `<p style="margin:10px 0 0;color:#a08060;font-style:italic;font-size:13px;">Note: ${order.notes}</p>` : ""}
        </div>`
        }
        ${
          order.orderType !== "pos"
            ? `
        <div style="margin-top:28px;text-align:center;">
          <a href="${this.storeUrl}/orders" style="background:linear-gradient(135deg,#8b6f47,#c8956c);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
            Track Your Order →
          </a>
        </div>`
            : ""
        }
        <p style="margin:24px 0 0;color:#a08060;font-size:13px;text-align:center;">
          Questions? Contact us at <a href="mailto:${this.configService.get("MAIL_USER")}" style="color:#8b6f47;">${this.configService.get("MAIL_USER")}</a>
        </p>
      `;

      const subject =
        order.orderType === "pos"
          ? `🧾 Your Receipt ${order.orderNumber} — Complementary Fashions`
          : `Order Confirmed ✅ ${order.orderNumber} — Complementary Fashions`;

      await this.transporter.sendMail({
        from: this.fromAddress,
        to: order.deliveryEmail,
        subject,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Order confirmation sent to ${order.deliveryEmail}`);
    } catch (error) {
      this.logger.error("Failed to send order confirmation email", error);
    }
  }

  // ─── Admin Notification: New Order ────────────────────────────────────────
  async sendAdminNewOrderNotification(
    order: any,
    adminEmail: string,
  ): Promise<void> {
    try {
      const itemsHtml = (order.items || [])
        .map(
          (item: any) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8df;color:#3d2b1f;">
            ${item.productName}${item.selectedSize ? ` (${item.selectedSize})` : ""}${item.selectedColor ? ` · ${item.selectedColor}` : ""}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8df;text-align:center;color:#7a5c44;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8df;text-align:right;color:#8b6f47;font-weight:600;">KSh ${Number(item.totalPrice).toLocaleString()}</td>
        </tr>
      `,
        )
        .join("");

      const actionNote =
        order.selectedPaymentMethod === "cod"
          ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-top:20px;">
            <strong style="color:#92400e;">💰 Action Required:</strong>
            <span style="color:#92400e;font-size:13px;"> Collect KSh ${Number(order.totalAmount).toLocaleString()} cash on delivery, then mark as Paid.</span>
           </div>`
          : order.selectedPaymentMethod === "later"
            ? `<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:12px 16px;margin-top:20px;">
            <strong style="color:#5b21b6;">📞 Action Required:</strong>
            <span style="color:#5b21b6;font-size:13px;"> Follow up with customer before shipping to arrange payment.</span>
           </div>`
            : "";

      const content = `
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#856404;">🛍️ New Order Received!</p>
          <p style="margin:6px 0 0;color:#856404;font-size:13px;">A customer just placed an order on your store.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr>
            <td style="padding:10px;background:#f0e8df;border-radius:8px;width:33%;">
              <p style="margin:0;font-size:11px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Order #</p>
              <p style="margin:4px 0 0;font-weight:700;color:#8b6f47;font-family:monospace;font-size:13px;">${order.orderNumber}</p>
            </td>
            <td style="padding:10px;width:4%;"></td>
            <td style="padding:10px;background:#f0e8df;border-radius:8px;width:33%;">
              <p style="margin:0;font-size:11px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Total</p>
              <p style="margin:4px 0 0;font-weight:700;color:#8b6f47;">KSh ${Number(order.totalAmount).toLocaleString()}</p>
            </td>
            <td style="padding:10px;width:4%;"></td>
            <td style="padding:10px;background:#f0e8df;border-radius:8px;width:33%;">
              <p style="margin:0;font-size:11px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Payment</p>
              <p style="margin:4px 0 0;font-weight:700;color:#8b6f47;font-size:12px;">${this.paymentMethodText(order.selectedPaymentMethod)}</p>
            </td>
          </tr>
        </table>
        <h3 style="color:#3d2b1f;font-size:14px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Customer Details</h3>
        <p style="margin:4px 0;color:#5a3e2b;"><strong>${order.deliveryFullName}</strong></p>
        <p style="margin:4px 0;color:#7a5c44;">📧 ${order.deliveryEmail}</p>
        <p style="margin:4px 0;color:#7a5c44;">📞 ${order.deliveryPhone}</p>
        <p style="margin:4px 0;color:#7a5c44;">📍 ${order.deliveryAddress}${order.deliveryCity ? ", " + order.deliveryCity : ""}</p>
        ${order.notes ? `<p style="margin:8px 0 0;color:#a08060;font-style:italic;font-size:13px;">Note: ${order.notes}</p>` : ""}
        <h3 style="color:#3d2b1f;font-size:14px;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px;">Items (${order.items?.length || 0})</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f0e8df;">
              <th style="padding:8px;text-align:left;font-size:12px;color:#a08060;text-transform:uppercase;">Product</th>
              <th style="padding:8px;text-align:center;font-size:12px;color:#a08060;text-transform:uppercase;">Qty</th>
              <th style="padding:8px;text-align:right;font-size:12px;color:#a08060;text-transform:uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:10px 0;font-weight:700;color:#8b6f47;border-top:2px solid #e8ddd5;">Total</td>
              <td style="padding:10px 0;text-align:right;font-weight:700;color:#8b6f47;border-top:2px solid #e8ddd5;">KSh ${Number(order.totalAmount).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        ${actionNote}
        <div style="margin-top:24px;text-align:center;">
          <a href="${this.adminUrl}/orders" style="background:linear-gradient(135deg,#8b6f47,#c8956c);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
            View Order in Admin Panel →
          </a>
        </div>
      `;

      await this.transporter.sendMail({
        from: this.fromAddress,
        to: adminEmail,
        subject: `🛍️ New Order ${order.orderNumber} — KSh ${Number(order.totalAmount).toLocaleString()} (${this.paymentMethodText(order.selectedPaymentMethod)})`,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Admin order notification sent to ${adminEmail}`);
    } catch (error) {
      this.logger.error("Failed to send admin order notification", error);
    }
  }

  // ─── Welcome Email ─────────────────────────────────────────────────────────
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const content = `
        <h2 style="margin:0 0 8px;color:#3d2b1f;font-size:22px;">Welcome, ${firstName}! 🎉</h2>
        <p style="margin:0 0 20px;color:#7a5c44;font-size:15px;">
          We're so glad you joined the Complementary Fashions family. Every piece in our collection is carefully handcrafted with love just for you.
        </p>
        <div style="background:#f0e8df;border-radius:10px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-weight:600;color:#3d2b1f;">Here's what you can do:</p>
          <p style="margin:6px 0;color:#7a5c44;">🧶 Browse our handcrafted crochet collection</p>
          <p style="margin:6px 0;color:#7a5c44;">❤️ Save your favourite pieces for later</p>
          <p style="margin:6px 0;color:#7a5c44;">🛒 Place an order and we'll deliver to you</p>
        </div>
        <div style="text-align:center;">
          <a href="${this.storeUrl}/products" style="background:linear-gradient(135deg,#8b6f47,#c8956c);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
            Explore the Collection →
          </a>
        </div>
      `;
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject: `Welcome to Complementary Fashions, ${firstName}! 🧶`,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error("Failed to send welcome email", error);
    }
  }

  // ─── Password Reset ────────────────────────────────────────────────────────
  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const resetUrl = `${this.storeUrl}/auth/forgot-password?token=${resetToken}`;
      const content = `
        <h2 style="margin:0 0 8px;color:#3d2b1f;font-size:22px;">Reset Your Password</h2>
        <p style="margin:0 0 20px;color:#7a5c44;font-size:15px;">
          Hi ${firstName}, we received a request to reset your password. Click the button below to create a new one.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="background:linear-gradient(135deg,#8b6f47,#c8956c);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
            Reset Password →
          </a>
        </div>
        <p style="color:#a08060;font-size:13px;text-align:center;">
          This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
        </p>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-top:20px;">
          <p style="margin:0;color:#92400e;font-size:12px;">
            🔒 If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color:#8b6f47;word-break:break-all;">${resetUrl}</a>
          </p>
        </div>
      `;
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject: `Reset Your Password — Complementary Fashions`,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error("Failed to send password reset email", error);
    }
  }

  // ─── Order Status Update ───────────────────────────────────────────────────
  async sendOrderStatusUpdate(order: any, newStatus: string): Promise<void> {
    try {
      const statusConfig: any = {
        processing: {
          emoji: "🔧",
          title: "Your order is being prepared!",
          color: "#1e40af",
          bg: "#dbeafe",
          border: "#bfdbfe",
          message: "Great news! We've started preparing your order with care.",
        },
        shipped: {
          emoji: "🚚",
          title: "Your order is on its way!",
          color: "#5b21b6",
          bg: "#ede9fe",
          border: "#ddd6fe",
          message: "Your order has been shipped and is heading your way!",
        },
        delivered: {
          emoji: "📦",
          title: "Your order has been delivered!",
          color: "#065f46",
          bg: "#d1fae5",
          border: "#a7f3d0",
          message:
            "Your order has been delivered. We hope you absolutely love it!",
        },
        cancelled: {
          emoji: "❌",
          title: "Your order has been cancelled",
          color: "#991b1b",
          bg: "#fee2e2",
          border: "#fecaca",
          message:
            "Your order has been cancelled. Please contact us if you have any questions.",
        },
      };

      const cfg = statusConfig[newStatus];
      if (!cfg) return;

      const content = `
        <div style="background:${cfg.bg};border:1px solid ${cfg.border};border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">${cfg.emoji}</div>
          <h2 style="margin:0;color:${cfg.color};font-size:20px;">${cfg.title}</h2>
        </div>
        <p style="color:#7a5c44;font-size:15px;text-align:center;">${cfg.message}</p>
        <div style="background:#f0e8df;border-radius:10px;padding:14px 20px;margin:20px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
          <p style="margin:4px 0 0;font-weight:700;color:#8b6f47;font-family:monospace;">${order.orderNumber}</p>
        </div>
        <div style="text-align:center;margin-top:24px;">
          <a href="${this.storeUrl}/orders/${order.id}" style="background:linear-gradient(135deg,#8b6f47,#c8956c);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
            View Order Details →
          </a>
        </div>
      `;

      await this.transporter.sendMail({
        from: this.fromAddress,
        to: order.deliveryEmail,
        subject: `${cfg.emoji} Order Update: ${order.orderNumber} — Complementary Fashions`,
        html: this.baseTemplate(content),
      });
      this.logger.log(
        `Order status update (${newStatus}) sent to ${order.deliveryEmail}`,
      );
    } catch (error) {
      this.logger.error("Failed to send order status update email", error);
    }
  }
}
