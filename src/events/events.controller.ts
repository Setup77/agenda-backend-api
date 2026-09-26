import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // =========================
  // ✅ CREATE (toujours user connecté)
  // =========================
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      title: string;
      description?: string;
      start: string;
      end: string;
      color?: string;
    },
  ) {
    const start = new Date(body.start);
    const end = new Date(body.end);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Dates invalides');
    }

    if (end <= start) {
      throw new BadRequestException(
        'La date de fin doit être supérieure à la date de début',
      );
    }

    return this.eventsService.create({
      title: body.title,
      description: body.description,
      start,
      end,
      color: body.color,
      userId: req.user.userId,
    });
  }

  // =========================
  // ✅ GET mes events
  // =========================
  @Get('me')
  async findMyEvents(@Req() req: RequestWithUser) {
    return this.eventsService.findByUser(req.user.userId);
  }

  // =========================
  // ✅ GET events d’un user (lecture)
  // =========================
  @Public()
  @Get('user/:id')
  async findEventsByUser(@Param('id') userId: string) {
    // ici on autorise la lecture
    return this.eventsService.findByUser(userId);
  }

  // =========================
  // ✅ UPDATE (ownership obligatoire)
  // =========================
  @Patch(':id')
  async updateEvent(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      start?: string;
      end?: string;
      color?: string;
    },
  ) {
    // validation dates si elles existent
    const start = body.start ? new Date(body.start) : undefined;
    const end = body.end ? new Date(body.end) : undefined;

    if (start && Number.isNaN(start.getTime())) {
      throw new BadRequestException('Date start invalide');
    }
    if (end && Number.isNaN(end.getTime())) {
      throw new BadRequestException('Date end invalide');
    }
    if (start && end && end <= start) {
      throw new BadRequestException(
        'La date de fin doit être supérieure à la date de début',
      );
    }

    const updated = await this.eventsService.updateOwnedEvent(
      id,
      req.user.userId,
      {
        title: body.title,
        description: body.description,
        start,
        end,
        color: body.color,
      },
    );

    if (!updated) {
      throw new NotFoundException('Event introuvable ou accès refusé');
    }

    return updated;
  }

  // =========================
  // ✅ DELETE (ownership obligatoire)
  // =========================
  @Delete(':id')
  async deleteEvent(@Req() req: RequestWithUser, @Param('id') id: string) {
    const deleted = await this.eventsService.deleteOwnedEvent(
      id,
      req.user.userId,
    );

    if (!deleted) {
      throw new NotFoundException('Événement introuvable ou accès refusé');
    }

    return { success: true };
  }
}
