import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { Payment, PaymentStatus, PaymentMethod } from "./payment.entity";
import { Order, OrderStatus } from "../orders/order.entity";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private async getMpesaToken(): Promise<string> {
    const consumerKey = this.configService.get("MPESA_CONSUMER_KEY");
    const consumerSecret = this.configService.get("MPESA_CONSUMER_SECRET");
    const credentials = Buffer.from(
      `${consumerKey}:${consumerSecret}`,
    ).toString("base64");

    const response = await firstValueFrom(
      this.httpService.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        { headers: { Authorization: `Basic ${credentials}` } },
      ),
    );
    return response.data.access_token;
  }

  async initiateMpesaStkPush(orderId: string, phoneNumber: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException("Order not found");

    const token = await this.getMpesaToken();
    const shortcode = this.configService.get("MPESA_SHORTCODE");
    const passkey = this.configService.get("MPESA_PASSKEY");
    const callbackUrl = this.configService.get("MPESA_CALLBACK_URL");

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
      "base64",
    );

    const formattedPhone = phoneNumber.startsWith("0")
      ? `254${phoneNumber.slice(1)}`
      : phoneNumber;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.ceil(order.totalAmount),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: order.orderNumber,
            TransactionDesc: `Payment for order ${order.orderNumber}`,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );

      // Save chosen method on order so admin can see it
      (order as any).selectedPaymentMethod = "stk";
      await this.ordersRepository.save(order);

      const payment = this.paymentsRepository.create({
        orderId,
        amount: order.totalAmount,
        method: PaymentMethod.MPESA,
        status: PaymentStatus.PENDING,
        phoneNumber: formattedPhone,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        rawResponse: response.data,
      });
      await this.paymentsRepository.save(payment);

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        message: "STK push sent. Please enter your M-Pesa PIN.",
      };
    } catch (error) {
      throw new BadRequestException("Failed to initiate M-Pesa payment");
    }
  }

  async handleMpesaCallback(callbackData: any) {
    const { Body } = callbackData;
    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    const payment = await this.paymentsRepository.findOne({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (!payment) return { message: "Payment not found" };

    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || [];
      const mpesaCode = items.find(
        (i: any) => i.Name === "MpesaReceiptNumber",
      )?.Value;

      payment.status = PaymentStatus.COMPLETED;
      payment.mpesaReceipt = mpesaCode;
      payment.rawResponse = { ...payment.rawResponse, callback: callbackData };
      await this.paymentsRepository.save(payment);

      await this.ordersRepository.update(payment.orderId, {
        status: OrderStatus.PAID,
      });
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.rawResponse = { ...payment.rawResponse, callback: callbackData };
      await this.paymentsRepository.save(payment);
    }

    return { message: "Callback processed" };
  }

  async checkPaymentStatus(checkoutRequestId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { checkoutRequestId },
    });
    if (!payment) throw new NotFoundException("Payment not found");

    const order = await this.ordersRepository.findOne({
      where: { id: payment.orderId },
    });

    return {
      status: payment.status,
      orderStatus: order?.status,
      mpesaReceipt: payment.mpesaReceipt,
    };
  }

  async getOrderPayments(orderId: string) {
    return this.paymentsRepository.find({
      where: { orderId },
      order: { createdAt: "DESC" },
    });
  }

  async confirmManualPayment(
    orderId: string,
    mpesaCode: string,
    method: string,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException("Order not found");

    // Always save the chosen payment method on the order so admin can see it
    (order as any).selectedPaymentMethod = method;

    // Pay on Delivery and Pay Later: keep order as PENDING
    // Admin will manually mark paid once cash/payment is actually received
    if (method === "cod" || method === "later") {
      await this.ordersRepository.save(order);
      return {
        message:
          method === "cod"
            ? "Order confirmed. Payment will be collected on delivery."
            : "Order confirmed. Please complete payment before your order is shipped.",
      };
    }

    // Paybill / Till / Send Money — customer has already paid, record it
    const payment = this.paymentsRepository.create({
      orderId,
      amount: order.totalAmount,
      mpesaReceipt: mpesaCode,
      status: PaymentStatus.COMPLETED,
      method: PaymentMethod.MPESA,
    });
    await this.paymentsRepository.save(payment);

    order.status = OrderStatus.PAID;
    await this.ordersRepository.save(order);

    return { message: "Payment confirmed successfully", payment };
  }
}
