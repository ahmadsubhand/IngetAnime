import path, { extname } from 'path';
import * as fs from 'fs';

export function saveLocalFile(
  folderPath: string,
  fileName: string,
  file: Express.Multer.File,
) {
  const fileNameWithExt = `${fileName}${extname(file.originalname)}`;
  const uploadDir = path.resolve('uploads', folderPath);
  const uploadPath = path.join(uploadDir, fileNameWithExt);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(uploadPath, file.buffer);

  return `/uploads/${folderPath}/${fileNameWithExt}`;
}

export function deleteLocalFile(filePath: string) {
  const fullFilePath = `.${filePath}`;
  if (fs.existsSync(fullFilePath)) {
    fs.unlinkSync(fullFilePath);
  }
}
