import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async userSignUp(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('fullName') fullName: string,
    @Body('role') role: string,
    @Body('facility') facility: string,
  ) {
    if (!email || !password || !fullName) {
      throw new BadRequestException('Email, password, and full name fields are strictly required.');
    }
    return await this.authService.signUp(email, password, fullName, role, facility);
  }

  @Post('login')
  async userLogin(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('Email and password properties must be provided.');
    }
    return await this.authService.login(email, password);
  }
}