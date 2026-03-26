import { Controller, Get, Post, Body, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AdminsService } from "./admins.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { LoginLogService } from "../login-log/login-log.service";

@ApiTags("Admin Dashboard")
@Controller("admin")
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly loginLogService: LoginLogService,
  ) {}

  @Post("seed")
  seedAdmin(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
  ) {
    return this.adminsService.seedAdmin(body);
  }

  @Get("dashboard")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getDashboard() {
    return this.adminsService.getDashboard();
  }

  @Get("login-logs")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getLoginLogs(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("userType") userType?: string,
    @Query("success") success?: string,
    @Query("search") search?: string,
  ) {
    return this.loginLogService.getLogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      userType,
      success: success !== undefined ? success === "true" : undefined,
      search,
    });
  }

  @Get("login-logs/stats")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getLoginStats() {
    return this.loginLogService.getStats();
  }
}
