import { registerDecorator, ValidationOptions } from 'class-validator';
import z from 'zod';

export function IsNoSymbols(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const schema = z
            .string()
            .regex(/^[a-zA-Z0-9]+$/, 'No symbols allowed');
          return schema.safeParse(value).success;
        },
        defaultMessage() {
          return 'Field must contain only alphanumeric characters (no symbols allowed)';
        },
      },
    });
  };
}
