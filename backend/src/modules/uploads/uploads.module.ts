import { Module, OnModuleInit } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { v4 as uuid } from "uuid";
import * as fs from "fs";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath =
            process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
          console.log("📁 Upload path:", uploadPath);
          console.log("📂 Current working directory:", process.cwd());
          console.log("🔍 Does upload path exist?", fs.existsSync(uploadPath));

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            console.log("✅ Created uploads directory");
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log("📸 Uploading file:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          extension: extname(file.originalname).toLowerCase(),
        });

        // Check by mimetype first (more reliable)
        const allowedMimeTypes = /image\/(jpeg|jpg|png|webp|gif|jfif)/;
        const mimeOk = allowedMimeTypes.test(file.mimetype);

        // Also check extension as fallback
        const allowedExtensions = /\.(jpeg|jpg|png|webp|gif|jfif)$/i;
        const extOk = allowedExtensions.test(file.originalname);

        if (mimeOk || extOk) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Only image files are allowed. Received: ${file.mimetype} (${file.originalname})`,
            ),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule implements OnModuleInit {
  onModuleInit() {
    const uploadPath = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`✅ Created uploads directory at module init: ${uploadPath}`);
    }
  }
}
