import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) {
      return 'User Already Registered';
    }
    const user = await this.usersService.create(dto);
    return this.generateToken(user.id);
  }

  async login(dto: LoginUserDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user.id);
  }

  async generateToken(userId: string) {
    const payload = { sub: userId };
    console.log(payload);
    console.log(this.jwtService.sign(payload));
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
