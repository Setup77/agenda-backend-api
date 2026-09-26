import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  NotFoundException,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { getAvatarAbsolutePath, safeUnlink } from '../utils/file.utils';

interface RequestWithUser extends Request {
  user: { userId: string };
}

// ✅ Interface personnalisée locale pour contourner le namespace global Express de Multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Liste des utilisateurs (public)
  @Get()
  async getAllUsers() {
    return this.usersService.findAllSafe();
  }

  // ✅ Profil connecté
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const user = await this.usersService.findByIdSafe(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  // ✅ Profil par id
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findByIdSafe(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  // ✅ Update fullname
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    const userId = req.user.userId;

    const updated = await this.usersService.updateProfile(userId, {
      fullname: dto.fullname?.trim(),
    });

    if (!updated) throw new NotFoundException('Utilisateur introuvable');
    return updated;
  }

  // ✅ Upload avatar
  @UseGuards(JwtAuthGuard)
  @Patch('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'uploads', 'avatars'),
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `avatar-${unique}${ext}`);
        },
      }),

      // validation taille max 2MB
      limits: { fileSize: 2 * 1024 * 1024 },

      // validation type
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Format invalide. Formats acceptés : jpg, png, webp',
            ) as any,
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Req() req: RequestWithUser,
    // ✅ Utilisation stricte de l'interface locale sans faire référence au namespace Express
    @UploadedFile() file: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier envoyé');
    }

    const userId = req.user.userId;

    // récupérer user actuel
    const current = await this.usersService.findByIdSafe(userId);
    if (!current) throw new NotFoundException('Utilisateur introuvable');

    // supprimer ancien avatar (sauf default.jpg)
    if (current.avatar && current.avatar !== 'default.jpg') {
      safeUnlink(getAvatarAbsolutePath(current.avatar));
    }

    // update DB
    const updated = await this.usersService.updateProfile(userId, {
      avatar: file.filename,
    });

    return updated;
  }
}
