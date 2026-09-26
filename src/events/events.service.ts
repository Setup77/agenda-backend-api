import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
  ) {}

  async create(data: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    color?: string;
    userId: string;
  }) {
    if (data.end <= data.start) {
      throw new BadRequestException(
        'La date de fin doit être supérieure à la date de début',
      );
    }

    const event = new this.eventModel({
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      user: new Types.ObjectId(data.userId),
      color: data.color,
    });

    return event.save();
  }

  async findByUser(userId: string) {
    return this.eventModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('user', 'username') // 🔥 This fetches the username from the User collection
      .sort({ start: 1 })
      .exec();
  }

  // 🔒 UPDATE seulement si event appartient au user
  async updateOwnedEvent(
    eventId: string,
    userId: string,
    patch: {
      title?: string;
      description?: string;
      start?: Date;
      end?: Date;
      color?: string;
    },
  ) {
    // 🔥 on récupère l'event existant (owned)
    const existing = await this.eventModel.findOne({
      _id: new Types.ObjectId(eventId),
      user: new Types.ObjectId(userId),
    });

    if (!existing) return null;

    const finalStart = patch.start ?? existing.start;
    const finalEnd = patch.end ?? existing.end;

    if (finalEnd <= finalStart) {
      throw new BadRequestException(
        'La date de fin doit être supérieure à la date de début',
      );
    }

    if (patch.title !== undefined) existing.title = patch.title;
    if (patch.description !== undefined)
      existing.description = patch.description;
    if (patch.start !== undefined) existing.start = patch.start;
    if (patch.end !== undefined) existing.end = patch.end;
    if (patch.color !== undefined) existing.color = patch.color;

    return existing.save();
  }

  // 🔒 DELETE seulement si event appartient au user
  async deleteOwnedEvent(eventId: string, userId: string) {
    return this.eventModel
      .findOneAndDelete({
        _id: new Types.ObjectId(eventId),
        user: new Types.ObjectId(userId),
      })
      .exec();
  }
}
