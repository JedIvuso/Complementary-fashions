import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LegalContent } from "./legal.entity";
import { LegalService } from "./legal.service";
import { LegalController } from "./legal.controller";

@Module({
  imports: [TypeOrmModule.forFeature([LegalContent])],
  controllers: [LegalController],
  providers: [LegalService],
})
export class LegalModule {}
