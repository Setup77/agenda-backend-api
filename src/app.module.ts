import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ✅ Serves user avatars statically
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // ✅ Dynamized Database connection fallback to local if variable missing
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/agenda_db',
    ),
    UsersModule,
    EventsModule,
    AuthModule,
  ],
})
export class AppModule {}
