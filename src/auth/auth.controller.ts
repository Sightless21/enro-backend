import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { LoginAuthDto } from './dto/login-auth-dto';
import { Public } from './decorator/public.decorator';
import { CurrentUser } from './decorator/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() data: RegisterAuthDto) {
    return this.authService.register(data);
  }

  @Public()
  @Post('register/google')
  async registerGoogle() {
    return this.authService.registerGoogle();
  }

  @Public()
  @Post('register/line')
  async registerLine() {
    return this.authService.registerLine();
  }

  @Public()
  @Post('login')
  async signIn(@Body() data: LoginAuthDto) {
    return this.authService.signIn(data);
  }

  @Get('me')
  async getMe(@CurrentUser('sub') userId: string) {
    return this.authService.getMe(userId);
  }
}
