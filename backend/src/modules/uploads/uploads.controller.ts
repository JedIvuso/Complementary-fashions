import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { UploadsService } from "./uploads.service";

@ApiTags("Uploads")
@Controller("uploads")
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("image")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadFile(file);
  }

  @Post("images")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FilesInterceptor("files", 10, { storage: memoryStorage() }))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadsService.uploadFiles(files);
  }
}
