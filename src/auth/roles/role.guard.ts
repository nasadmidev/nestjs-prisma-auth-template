import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestAuthorized } from '../auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: Pick<ExecutionContext, 'getHandler' | 'getClass' | 'switchToHttp'>,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<RequestAuthorized>();
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }
}
