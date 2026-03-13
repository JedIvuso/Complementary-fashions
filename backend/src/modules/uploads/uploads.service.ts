import { Injectable } from "@nestjs/common";

@Injectable()
export class UploadsService {
  processUploadedFiles(files: Express.Multer.File[]) {
    return files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `/uploads/${file.filename}`, // Return relative path
      size: file.size,
      mimetype: file.mimetype,
    }));
  }
}
