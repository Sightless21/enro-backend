import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { LoginAuthDto } from './dto/login-auth-dto';
import { PrismaService } from '@prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthProviderType, Role } from '@prisma/client';
import argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(data: RegisterAuthDto) {
    return await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await argon2.hash(data.password);

      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: Role.STUDENT,

          studentProfile: {
            create: {},
          },

          authProviders: {
            create: {
              provider: AuthProviderType.LOCAL,
              passwordHash: hashedPassword,
            },
          },
        },
        include: {
          studentProfile: true,
        },
      });

      return user;
    });
  }

  async registerGoogle() {
    // TODO: Implement Google registration
  }

  async registerLine() {
    // TODO: Implement Line registration
  }

  async signIn(data: LoginAuthDto) {
    const authProvider = await this.prisma.authProvider.findFirst({
      where: {
        provider: AuthProviderType.LOCAL,
        user: {
          email: data.email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!authProvider || !authProvider.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(
      authProvider.passwordHash,
      data.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = authProvider.user;

    if (!user.isActive) {
      throw new ForbiddenException('User is not active');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    } as const;

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signOut() {
    // TODO: Implement sign out
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
