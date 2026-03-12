import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentSettings } from "./payment-settings.entity";

@Injectable()
export class PaymentSettingsService {
  constructor(
    @InjectRepository(PaymentSettings)
    private repo: Repository<PaymentSettings>,
  ) {}

  async getSettings() {
    let settings = await this.repo.findOne({ where: {} });
    if (!settings) {
      settings = this.repo.create({
        payOnDeliveryEnabled: true,
        payOnDeliveryInstructions: "Pay cash when your order is delivered.",
      });
      await this.repo.save(settings);
    }
    return settings;
  }

  async getPublicSettings() {
    const s = await this.getSettings();
    // Return only what the customer needs — no API keys
    return {
      mpesaStkEnabled: s.mpesaStkEnabled,
      mpesaShortcode: s.mpesaShortcode,
      paybillEnabled: s.paybillEnabled,
      paybillNumber: s.paybillNumber,
      paybillAccountFormat: s.paybillAccountFormat,
      paybillStoreName: s.paybillStoreName,
      tillEnabled: s.tillEnabled,
      tillNumber: s.tillNumber,
      tillName: s.tillName,
      sendMoneyEnabled: s.sendMoneyEnabled,
      sendMoneyPhone: s.sendMoneyPhone,
      sendMoneyName: s.sendMoneyName,
      payOnDeliveryEnabled: s.payOnDeliveryEnabled,
      payOnDeliveryInstructions: s.payOnDeliveryInstructions,
      payLaterEnabled: s.payLaterEnabled,
      payLaterInstructions: s.payLaterInstructions,
      deliveryFee: Number(s.deliveryFee ?? 200),
      freeDeliveryThreshold: s.freeDeliveryThreshold
        ? Number(s.freeDeliveryThreshold)
        : null,
    };
  }

  async updateSettings(data: Partial<PaymentSettings>) {
    let settings = await this.repo.findOne({ where: {} });
    if (!settings) {
      settings = this.repo.create(data);
    } else {
      Object.assign(settings, data);
    }
    return this.repo.save(settings);
  }
}
