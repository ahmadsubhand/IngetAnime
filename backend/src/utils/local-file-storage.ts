import path, { extname, basename, sep } from 'path';
import * as fs from 'fs';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export function saveLocalFile(
  folderPath: string,
  fileName: string,
  file: Express.Multer.File,
) {
  const safeFileName = basename(fileName);
  const safeFolderPath = path.normalize(folderPath);

  if (
    path.isAbsolute(safeFolderPath) ||
    safeFolderPath === '..' ||
    safeFolderPath.startsWith(`..${sep}`)
  ) {
    throw new Error('Invalid upload folder path');
  }

  const uploadDir = path.resolve(UPLOAD_DIR, safeFolderPath);
  const relativePath = path.relative(UPLOAD_DIR, uploadDir);

  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error('Invalid upload folder path');
  }

  const fileNameWithExt = `${safeFileName}${extname(file.originalname)}`;
  const uploadPath = path.join(uploadDir, fileNameWithExt);

  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(uploadPath, file.buffer);

  return `/uploads/${safeFolderPath}/${fileNameWithExt}`;
}

export function deleteLocalFile(filePath: string) {
  if (!filePath.startsWith('/uploads/')) {
    throw new Error('Invalid upload file path');
  }

  const relativePath = filePath.slice('/uploads/'.length);
  const fullFilePath = path.resolve(UPLOAD_DIR, relativePath);
  const relativeToUpload = path.relative(UPLOAD_DIR, fullFilePath);

  if (
    !relativeToUpload ||
    relativeToUpload === '..' ||
    relativeToUpload.startsWith(`..${sep}`) ||
    path.isAbsolute(relativeToUpload)
  ) {
    throw new Error('Invalid upload file path');
  }

  if (fs.existsSync(fullFilePath)) {
    fs.unlinkSync(fullFilePath);
  }
}
