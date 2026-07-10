import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { CourseCategoriesModule } from './course-categories/course-categories.module';
import { InstallmentsModule } from './installments/installments.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ClassSessionsModule } from './class-sessions/class-sessions.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    CoursesModule,
    OrdersModule,
    AuthModule,
    CourseCategoriesModule,
    InstallmentsModule,
    EnrollmentsModule,
    ClassSessionsModule,
    StudentsModule,
    TeachersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
