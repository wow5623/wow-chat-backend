import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('createUser')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllUsers')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllUsersExpectMe')
  getAllUsersExpectMe(@Request() req) {
    return this.usersService.getAllUsersExpectMe(req.user);
  }

  @Get('getUserByLogin/:email')
  getUserByEmail(@Param('email') login: string) {
    return this.usersService.getUserByEmail(login);
  }

  @Get('activateEmail/:userId')
  async activateEmail(@Param('userId') login: string, @Response() res) {
    return this.usersService.activateEmail(login, res);
  }
}
