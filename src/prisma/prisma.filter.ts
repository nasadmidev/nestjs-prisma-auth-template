import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const response = {
      statusCode: 500,
      message: 'Prisma error',
      date: new Date().toISOString(),
    };

    switch (exception.code) {
      // Conflict errors (4xx)
      case 'P2002':
        response.statusCode = 409;
        response.message = 'Unique constraint failed';
        break;
      case 'P2011':
        response.statusCode = 409;
        response.message = 'Null constraint violation';
        break;
      case 'P2014':
        response.statusCode = 409;
        response.message = 'Required relation constraint violated';
        break;

      // Not found errors (4xx)
      case 'P2025':
        response.statusCode = 404;
        response.message = `${(exception.meta?.cause as string) || 'Record not found.'} On model: ${(exception.meta?.modelName as string) || 'Unknown Model'}`;
        break;
      case 'P2015':
        response.statusCode = 404;
        response.message = 'Related record not found';
        break;
      case 'P2017':
        response.statusCode = 404;
        response.message = 'Records for relation check do not exist';
        break;

      // Validation / Bad request errors (4xx)
      case 'P2003':
        response.statusCode = 400;
        response.message = 'Foreign key constraint failed';
        break;
      case 'P2005':
        response.statusCode = 400;
        response.message = 'Invalid value for field';
        break;
      case 'P2006':
        response.statusCode = 400;
        response.message = 'Provided value is not valid for field';
        break;
      case 'P2004':
        response.statusCode = 400;
        response.message = 'Constraint failed on database';
        break;
      case 'P2007':
        response.statusCode = 400;
        response.message = 'Data integrity violation';
        break;
      case 'P2012':
        response.statusCode = 400;
        response.message = 'Missing required value';
        break;
      case 'P2013':
        response.statusCode = 400;
        response.message = 'Missing argument for required argument';
        break;
      case 'P2019':
        response.statusCode = 400;
        response.message = 'Input error';
        break;
      case 'P2020':
        response.statusCode = 400;
        response.message = 'Unable to match value to any model';
        break;
      case 'P2023':
        response.statusCode = 400;
        response.message = 'Data integrity error';
        break;

      // Query/Schema errors (5xx)
      case 'P2008':
        response.statusCode = 500;
        response.message = 'Failed to parse the query';
        break;
      case 'P2009':
        response.statusCode = 500;
        response.message = 'Failed to validate the query';
        break;
      case 'P2010':
        response.statusCode = 500;
        response.message = 'Raw query failed';
        break;
      case 'P2016':
        response.statusCode = 500;
        response.message = 'Query interpretation error';
        break;
      case 'P2018':
        response.statusCode = 500;
        response.message = 'Connection not established';
        break;
      case 'P2021':
        response.statusCode = 500;
        response.message = 'Table does not exist';
        break;
      case 'P2022':
        response.statusCode = 500;
        response.message = 'Column does not exist';
        break;
      case 'P2024':
        response.statusCode = 503;
        response.message = 'Operation in progress, please retry';
        break;
      case 'P2026':
        response.statusCode = 500;
        response.message = 'Query is incompatible with migrations';
        break;
      case 'P2027':
        response.statusCode = 500;
        response.message = 'Multiple errors occurred';
        break;
      case 'P2030':
        response.statusCode = 504;
        response.message = 'Transaction timeout';
        break;
      case 'P2031':
        response.statusCode = 500;
        response.message = 'Schema needs migrations';
        break;
      case 'P2033':
        response.statusCode = 500;
        response.message = 'Number out of range';
        break;

      default:
        response.statusCode = 500;
        response.message = 'Internal server error';
    }

    return res.status(response.statusCode).json(response);
  }
}
