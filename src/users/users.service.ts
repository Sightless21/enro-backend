import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthProviderType, Role } from '@prisma/client';
import argon2 from 'argon2';
import { UpdateUsersDto } from './dto/update-users.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async create(data: CreateAdminDto) {
    return this.prisma.$transaction(async (tx) => {
      const userExists = await tx.user.findUnique({
        where: { email: data.email },
      });
      if (userExists) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await argon2.hash(data.password);

      await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: data.role,
          authProviders: {
            create: {
              provider: AuthProviderType.LOCAL,
              passwordHash: hashedPassword,
            },
          },
          ...(data.role === Role.STUDENT && { studentProfile: { create: {} } }),
          ...(data.role === Role.TEACHER && { teacherProfile: { create: {} } }),
        },
      });

      return { message: `User ${data.role} created successfully` };
    });
  }

  async update(id: string, data: UpdateUsersDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isRoleChanging = data.role !== undefined && data.role !== user.role;

    if (user.role === Role.ADMIN && isRoleChanging) {
      const countAdmin = await this.prisma.user.count({
        where: {
          role: Role.ADMIN,
        },
      });

      if (countAdmin === 1) {
        throw new ConflictException(
          'Cannot change the last admin user to a different role',
        );
      }
    }

    await this.prisma.user.update({
      where: { id },
      data,
    });

    return {
      message: 'User updated successfully',
    };
  }

  async resetPassword(id: string, data: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await argon2.hash(data.newPassword);

    await this.prisma.user.update({
      where: { id },
      data: {
        authProviders: {
          update: {
            where: {
              userId_provider: {
                userId: id,
                provider: AuthProviderType.LOCAL,
              },
            },
            data: {
              passwordHash: hashedPassword,
            },
          },
        },
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
