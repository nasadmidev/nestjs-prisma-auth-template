import { Strategy } from 'passport-local';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'identity',
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  async validate(identity: string, password: string) {
    const user = await this.authService.authenticate({ identity, password });
    if (!user) throw new ForbiddenException('Invalid credentials');
    return user;
  }
}
