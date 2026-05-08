// prisma.filter.spec.ts
import { ArgumentsHost } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaFilter } from './prisma.filter';
import type { Response } from 'express';
import { prismaVersion } from '@/generated/prisma/internal/prismaNamespace';

const codes = [
  // 409 Conflict
  { code: 'P2002', status: 409, message: 'Unique constraint failed' },
  { code: 'P2011', status: 409, message: 'Null constraint violation' },
  {
    code: 'P2014',
    status: 409,
    message: 'Required relation constraint violated',
  },
  // 404 Not Found
  { code: 'P2015', status: 404, message: 'Related record not found' },
  {
    code: 'P2017',
    status: 404,
    message: 'Records for relation check do not exist',
  },
  // 400 Bad Request
  { code: 'P2003', status: 400, message: 'Foreign key constraint failed' },
  { code: 'P2005', status: 400, message: 'Invalid value for field' },
  {
    code: 'P2006',
    status: 400,
    message: 'Provided value is not valid for field',
  },
  // 500 Server Error
  { code: 'P2008', status: 500, message: 'Failed to parse the query' },
  {
    code: 'P2024',
    status: 503,
    message: 'Operation in progress, please retry',
  },
  { code: 'P2030', status: 504, message: 'Transaction timeout' },
  // Unknown
  { code: 'P9999', status: 500, message: 'Internal server error' },
] as const;

describe('PrismaFilter', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  const filter = new PrismaFilter();

  describe.each(codes)('code $code', ({ code, status, message }) => {
    it(`should return status ${status} and message "${message}"`, () => {
      const mockHost = {
        switchToHttp: () => ({ getResponse: () => mockResponse }),
      } as unknown as ArgumentsHost;

      const exception = { code } as PrismaClientKnownRequestError;
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(status);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: status,
          message,
          date: expect.any(String) as string,
        }),
      );
    });
  });

  describe('should return a 404 on P2025', () => {
    const mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as unknown as ArgumentsHost;

    it('should return an special message on known modelName and cause', () => {
      const exception = new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: prismaVersion.client,
        meta: {
          modelName: 'User',
          cause: 'Record to update not found.',
        },
      });

      filter.catch(exception, mockHost);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Record to update not found. On model: User',
          date: expect.any(String) as string,
        }),
      );
    });

    it('should return an special message on unknown modelName and cause', () => {
      const exception = new PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: prismaVersion.client,
      });

      filter.catch(exception, mockHost);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Record not found. On model: Unknown Model',
          date: expect.any(String) as string,
        }),
      );
    });
  });
});
