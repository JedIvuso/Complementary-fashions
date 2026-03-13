import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
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
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // Return the path that matches your static asset prefix
    return {
      url: `/uploads/${file.filename}`, // Changed from full URL to relative path
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }

  @Post("images")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FilesInterceptor("files", 10))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded");
    }

    return this.uploadsService.processUploadedFiles(files);
  }
}
