import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { AboutContent } from './about.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AboutContent])],
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule {}
