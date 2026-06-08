import { Controller, Get, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllProfiles() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateProfile(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}