import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullname!: string; // Ajoute ! après le nom

  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ default: 'default.jpg' })
  avatar!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
