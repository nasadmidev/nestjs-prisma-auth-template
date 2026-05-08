import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { Request } from 'express';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';

describe('JwtGuard', () => {
  const jwtMock: DeepMockProxy<JwtService> = mockDeep<JwtService>();
  const reflectorMock: DeepMockProxy<Reflector> = mockDeep<Reflector>();
  reflectorMock.getAllAndOverride.mockReturnValue(false);

  it('should be defined', () => {
    expect(new JwtGuard(jwtMock, reflectorMock)).toBeDefined();
  });

  describe('extractTokenFromHeader', () => {
    it('should return null if no authorization header', () => {
      const guard = new JwtGuard(jwtMock, reflectorMock);
      const request = { headers: {} } as Request;
      expect(guard.extractTokenFromHeader(request)).toBeNull();
    });

    it('should return null if authorization header is not Bearer', () => {
      const guard = new JwtGuard(jwtMock, reflectorMock);
      const request = { headers: { authorization: 'Basic abc123' } } as Request;
      expect(guard.extractTokenFromHeader(request)).toBeNull();
    });

    it('should return token if authorization header is Bearer', () => {
      const guard = new JwtGuard(jwtMock, reflectorMock);
      const request = {
        headers: { authorization: 'Bearer abc123' },
      } as Request;
      expect(guard.extractTokenFromHeader(request)).toBe('abc123');
    });
  });

  describe('canActivate', () => {
    const createContext = (
      token?: string,
    ): Pick<ExecutionContext, 'switchToHttp' | 'getClass' | 'getHandler'> =>
      ({
        switchToHttp: () => ({
          getRequest: () =>
            ({
              headers: {
                authorization: `Bearer ${token || ''}`,
              },
            }) as Request,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
      }) as Pick<ExecutionContext, 'switchToHttp' | 'getClass' | 'getHandler'>;

    it('should return true if route is public', async () => {
      reflectorMock.getAllAndOverride.mockReturnValueOnce(true);
      const guard = new JwtGuard(jwtMock, reflectorMock);
      expect(await guard.canActivate(createContext() as ExecutionContext)).toBe(
        true,
      );
    });

    it('should throw UnauthorizedException if no token', async () => {
      const guard = new JwtGuard(jwtMock, reflectorMock);
      await expect(
        guard.canActivate(createContext() as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return true if token is valid', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: '123', username: 'test' });
      const guard = new JwtGuard(jwtMock, reflectorMock);
      expect(
        await guard.canActivate(
          createContext('valid-token') as ExecutionContext,
        ),
      ).toBe(true);
    });

    it('should throw ForbiddenException if token is expired', async () => {
      const date = new Date();
      jwtMock.verifyAsync.mockRejectedValue(
        new TokenExpiredError('Token expired', date),
      );
      const guard = new JwtGuard(jwtMock, reflectorMock);
      await expect(
        guard.canActivate(createContext('expired-token') as ExecutionContext),
      ).rejects.toThrow(`Token expired: ${date.toISOString()}`);
    });

    it('should throw ForbiddenException if token is invalid', async () => {
      jwtMock.verifyAsync.mockRejectedValue(
        new JsonWebTokenError('Invalid token'),
      );
      const guard = new JwtGuard(jwtMock, reflectorMock);
      await expect(
        guard.canActivate(createContext('invalid-token') as ExecutionContext),
      ).rejects.toThrow('Invalid token');
    });
  });
});
