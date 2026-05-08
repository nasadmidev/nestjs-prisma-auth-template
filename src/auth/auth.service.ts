import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthDTO } from './auth.dto';
import { User } from '@/generated/prisma/client';
import { TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';

export type JwtPayload = {
  sub: string;
  username: string;
  role: string;
  exp?: number;
  iat?: number;
};

export type RequestAuthorized = Partial<Request> & { user: JwtPayload };

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async authenticate({ identity, password }: AuthDTO) {
    const user = identity.includes('@')
      ? await this.userService.findOneByEmail(identity)
      : await this.userService.findOneByUsername(identity);

    if (!user) return null;
    if (!(await compare(password, user.password))) return null;
    return user;
  }

  async login(user: User | null) {
    if (!user) throw new BadRequestException('User is required');
    const { id, username, role } = user;

    const payload = { sub: id, username, role };
    return await this.jwt.signAsync(payload);
  }

  async regenerateToken(token: string) {
    try {
      const result = await this.jwt.verifyAsync<JwtPayload>(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { exp, iat, ...payload } = result;
      return await this.jwt.signAsync(payload);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new ForbiddenException(
          `Token expired: ${e.expiredAt.toISOString()}`,
        );
      }
      if (e instanceof JsonWebTokenError) {
        throw new ForbiddenException('Invalid token');
      }
      return null;
    }
  }
}
