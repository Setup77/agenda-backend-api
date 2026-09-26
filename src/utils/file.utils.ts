import * as fs from 'fs';
import * as path from 'path';

export function safeUnlink(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // on ignore pour éviter crash
  }
}

export function getAvatarAbsolutePath(filename: string) {
  return path.join(process.cwd(), 'uploads', 'avatars', filename);
}
