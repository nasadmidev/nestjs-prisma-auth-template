import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidUUIDException extends HttpException {
  constructor(id: string, fieldName = 'ID') {
    super(
      `Invalid UUID format for ${fieldName}: ${id}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
