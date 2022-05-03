import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';
import { AuthHelper } from './auth.helper';
import { CreateUserDto } from '../users/dto/create.user.dto';
import { LoginUserDto } from './dto/login.user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /*public async login(user: UserDocument) {
    const payload = { email: user.email, name: user.name, sub: user._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }*/

  public async login(dto: LoginUserDto) {
    const user = await this.usersService.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(
        `Пользователя с email ${dto.email} не существует`,
      );
    }
    const isPasswordsMatch = await AuthHelper.comparePasswords(
      dto.password,
      user.password,
    );
    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }
    return {
      accessToken: this.generateUserToken(user),
      user: {
        email: user.email,
        name: user.name,
      },
    };
  }

  public async register(dto: CreateUserDto) {
    const candidate = await this.usersService.findUserByEmail(dto.email);
    if (!!candidate) {
      throw new HttpException('Пользователь уже существует', HttpStatus.OK);
    }
    const hashedPassword = await AuthHelper.hashPassword(dto.password);
    const user: UserDocument = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
    });
    return {
      accessToken: this.generateUserToken(user),
      user: {
        email: user.email,
        name: user.name,
      },
    };
  }

  public async validateToken(accessToken: string) {
    try {
      const user: UserDocument = await this.jwtService.verify(accessToken);

      if (!user) {
        throw new UnauthorizedException(
          'Пользователь с таким токеном не найден, вы не авторизованы!',
        );
      }

      return {
        accessToken: accessToken,
        user: {
          email: user.email,
          name: user.name,
        },
      };
    } catch (err) {
      throw new UnauthorizedException('Токен невалиден, вы не авторизованы!');
    }
  }

  private generateUserToken(user: UserDocument) {
    const payload = {
      email: user.email,
      name: user.name,
      sub: user._id,
    };
    return this.jwtService.sign(payload, {
      noTimestamp: true,
    });
  }
}