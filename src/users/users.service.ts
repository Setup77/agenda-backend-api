import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async findAll() {
    return this.userModel.find().select('-password');
  }

  async findByIdSafe(id: string) {
    return this.userModel
      .findById(id)
      .select('-password') // 🔥 IMPORTANT
      .lean();
  }

  async updateProfile(
    userId: string,
    data: { fullname?: string; avatar?: string },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    if (typeof data.fullname === 'string') user.fullname = data.fullname;
    if (typeof data.avatar === 'string') user.avatar = data.avatar;

    await user.save();

    // Retour safe (sans password)
    return this.findByIdSafe(userId);
  }

  async findAllSafe() {
    return this.userModel
      .find()
      .select('_id fullname username email isActive avatar createdAt updatedAt')
      .sort({ createdAt: -1 });
  }
}
