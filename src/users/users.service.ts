import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create.user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    private mailService: MailService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const email = createUserDto.email;

    const userWithCurrentLogin = await this.findUserByEmail(email);

    if (userWithCurrentLogin) {
      throw new BadRequestException(
        `Пользовать с email ${email} уже существует. Введите другой логин и попробуйте снова.`,
      );
    }

    const user = await this.userRepository.create({
      ...createUserDto,
      isEmailActivated: false,
    });

    await this.mailService.sendMessage({
      to: email,
      subject: 'Активация email',
      text: `Ссылка для активации: http://localhost:7777/users/activateEmail/${user._id}`,
    });

    return user;
  }

  getAllUsers() {
    return this.userRepository.find();
  }

  async getUserByEmail(email: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(`Пользовать с email ${email} не найден.`);
    }

    return user;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ email });
  }

  async activateEmail(userId: string) {
    const user: UserDocument = await this.userRepository.findOne({
      _id: userId,
    });

    if (!user) {
      throw new NotFoundException('Ошибка при попытке активировать email.');
    }

    await user.updateOne({
      isEmailActivated: true,
    });

    return this.userRepository.findOne({
      _id: user._id,
    });
  }
}
