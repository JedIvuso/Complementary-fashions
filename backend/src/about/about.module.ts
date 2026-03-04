// about.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutContent } from './entities/about-content.entity';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutContent])],
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule {}
