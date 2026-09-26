import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title!: string; // Ajout du ! ici

  @Prop()
  description?: string; // Pas besoin de ! car optionnel (?)

  @Prop({ required: true })
  start!: Date; // Ajout du ! ici

  @Prop({ required: true })
  end!: Date; // Ajout du ! ici

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user!: Types.ObjectId; // Ajout du ! ici

  @Prop({
    type: String,
    default: '#0d6efd', // bleu bootstrap par défaut
  })
  color!: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
