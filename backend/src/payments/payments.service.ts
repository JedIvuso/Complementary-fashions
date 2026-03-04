import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { MailService } from '../mail/mail.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    private httpService: HttpService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  private async getMpesaToken(): Promise<string> {
    const key = this.configService.get('MPESA_CONSUMER_KEY');
    const secret = this.configService.get('MPESA_CONSUMER_SECRET');
    const env = this.configService.get('MPESA_ENV', 'sandbox');
    const url = env === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        headers: { Authorization: `Basic ${credentials}` },
      }),
    );
    return data.access_token;
  }

  async initiateStkPush(orderId: string, phone: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const token = await this.getMpesaToken();
    const env = this.configService.get('MPESA_ENV', 'sandbox');
    const url = env === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const paybill = this.configService.get('MPESA_PAYBILL_NUMBER');
    const passkey = this.configService.get('MPESA_PASSKEY');
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${paybill}${passkey}${timestamp}`).toString('base64');

    const formattedPhone = phone.startsWith('+') ? phone.slice(1) : phone.startsWith('0') ? `254${phone.slice(1)}` : phone;

    const { data } = await firstValueFrom(
      this.httpService.post(url, {
        BusinessShortCode: paybill,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(order.total),
        PartyA: formattedPhone,
        PartyB: paybill,
        PhoneNumber: formattedPhone,
        CallBackURL: this.configService.get('MPESA_CALLBACK_URL'),
        AccountReference: order.orderNumber,
        TransactionDesc: `Payment for order ${order.orderNumber}`,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

    // Create payment record
    const payment = this.paymentRepo.create({
      orderId,
      amount: order.total,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.MPESA,
      phoneNumber: formattedPhone,
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
    });
    await this.paymentRepo.save(payment);

    return {
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
      responseDescription: data.ResponseDescription,
    };
  }

  async handleCallback(callbackData: any) {
    const { Body } = callbackData;
    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    const payment = await this.paymentRepo.findOne({
      where: { checkoutRequestId: CheckoutRequestID },
      relations: ['order'],
    });

    if (!payment) return;

    if (ResultCode === 0) {
      // Success
      const meta = CallbackMetadata?.Item || [];
      const receipt = meta.find((m: any) => m.Name === 'MpesaReceiptNumber')?.Value;

      payment.status = PaymentStatus.SUCCESS;
      payment.mpesaReceiptNumber = receipt;
      payment.callbackData = callbackData;
      await this.paymentRepo.save(payment);

      // Update order
      const order = payment.order;
      order.status = OrderStatus.PAID;
      await this.orderRepo.save(order);

      // Clear cart
      await this.cartRepo.delete({ userId: order.userId });

      // Send confirmation email
      await this.mailService.sendOrderConfirmation(order);
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.callbackData = callbackData;
      await this.paymentRepo.save(payment);
    }
  }

  async checkPaymentStatus(checkoutRequestId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { checkoutRequestId },
      relations: ['order'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return {
      status: payment.status,
      receipt: payment.mpesaReceiptNumber,
      order: payment.order,
    };
  }

  async confirmManually(orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    let payment = await this.paymentRepo.findOne({ where: { orderId } });
    if (!payment) {
      payment = this.paymentRepo.create({
        orderId,
        amount: order.total,
        method: PaymentMethod.MANUAL,
        status: PaymentStatus.SUCCESS,
      });
    } else {
      payment.status = PaymentStatus.SUCCESS;
    }
    await this.paymentRepo.save(payment);

    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    return { message: 'Payment confirmed manually' };
  }
}
