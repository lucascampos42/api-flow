import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { UserPayload } from './models/UserPayload';
import { UserWithoutPassword } from './models/UserWithoutPassword';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userService.findOneByEmailOrUsername(identifier);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result as UserWithoutPassword;
    }
    return null;
  }

  async login(user: UserWithoutPassword) {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
