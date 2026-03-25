import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { LegalService } from "./legal.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";

@ApiTags("Legal")
@Controller("legal")
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  // Public - anyone can read
  @Get()
  get() {
    return this.legalService.get();
  }

  // Admin only - update
  @Put()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  update(
    @Body() body: { privacyPolicy?: string; termsAndConditions?: string },
  ) {
    return this.legalService.updateAll(body);
  }
}
