import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { PosService } from "./pos.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("POS")
@Controller("pos")
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post("orders")
  createOrder(@Body() dto: any, @CurrentUser() admin: any) {
    return this.posService.createPosOrder(dto, admin);
  }

  @Get("analytics")
  getAnalytics(@Query("period") period: string) {
    return this.posService.getAnalytics(period || "today");
  }

  @Get("reports")
  getReport(
    @Query("type") type: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    const end = endDate || new Date().toISOString().split("T")[0];
    const start = startDate || end;
    return this.posService.getReport(type || "all", start, end);
  }

  @Get("cash-drawer")
  getCashDrawer(@Query("date") date: string) {
    return this.posService.getCashDrawer(
      date || new Date().toISOString().split("T")[0],
    );
  }
}
