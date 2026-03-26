import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoginLog } from "./login-log.entity";

@Injectable()
export class LoginLogService {
  constructor(
    @InjectRepository(LoginLog)
    private logRepository: Repository<LoginLog>,
  ) {}

  async log(data: {
    email: string;
    userType: "customer" | "admin";
    fullName?: string;
    success: boolean;
    failureReason?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const entry = this.logRepository.create(data);
    await this.logRepository.save(entry).catch(() => {}); // non-blocking
  }

  async getLogs(filters: {
    page?: number;
    limit?: number;
    userType?: string;
    success?: boolean;
    search?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const qb = this.logRepository
      .createQueryBuilder("log")
      .orderBy("log.created_at", "DESC")
      .skip(skip)
      .take(limit);

    if (filters.userType) {
      qb.andWhere("log.user_type = :userType", { userType: filters.userType });
    }
    if (filters.success !== undefined) {
      qb.andWhere("log.success = :success", { success: filters.success });
    }
    if (filters.search) {
      qb.andWhere("(log.email ILIKE :search OR log.full_name ILIKE :search)", {
        search: `%${filters.search}%`,
      });
    }

    const [logs, total] = await qb.getManyAndCount();
    return { logs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayTotal, failures, uniqueToday] = await Promise.all([
      this.logRepository.count(),
      this.logRepository
        .count({ where: {} })
        .then(() =>
          this.logRepository
            .createQueryBuilder("log")
            .where("log.created_at >= :today", { today })
            .getCount(),
        ),
      this.logRepository
        .createQueryBuilder("log")
        .where("log.success = false")
        .andWhere("log.created_at >= :today", { today })
        .getCount(),
      this.logRepository
        .createQueryBuilder("log")
        .select("COUNT(DISTINCT log.email)", "count")
        .where("log.created_at >= :today", { today })
        .andWhere("log.success = true")
        .getRawOne(),
    ]);

    return {
      totalLogins: total,
      loginsToday: todayTotal,
      failedToday: failures,
      uniqueUsersToday: parseInt(uniqueToday?.count || "0"),
    };
  }
}
