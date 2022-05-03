import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('createUser')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('getAllUsers')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('getUserByLogin/:email')
  getUserByEmail(@Param('email') login: string) {
    return this.usersService.getUserByEmail(login);
  }

  @Get('activateEmail/:userId')
  activateEmail(@Param('userId') login: string) {
    return this.usersService.activateEmail(login);
  }
}
