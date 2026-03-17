import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AdminsService } from "./admins.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";

@ApiTags("Admin Dashboard")
@Controller("admin")
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

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
}
