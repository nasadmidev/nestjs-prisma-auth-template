import { randomUUID } from 'crypto';
import { UuidValidatorPipe } from './uuid-validator.pipe';

const TestDTO: { name: string; otherId: string } = {
  name: 'Name',
  otherId: randomUUID(),
};

describe('UuidValidatorPipe', () => {
  it('should be defined', () => {
    expect(new UuidValidatorPipe()).toBeDefined();
  });

  const paramPipe = new UuidValidatorPipe();
  const bodyPipe = new UuidValidatorPipe<typeof TestDTO>(['otherId']);

  it('should throw InvalidUUIDException', () => {
    expect(() =>
      paramPipe.transform('invalid-id', { type: 'param' }),
    ).toThrow();
  });

  it('should return true', () => {
    const id = randomUUID();
    expect(paramPipe.transform(id, { type: 'param' })).toEqual(id);
  });

  it('should throw InvalidUUIDException on genreId invalid', () => {
    expect(() =>
      bodyPipe.transform(
        { ...TestDTO, otherId: 'invalid-id' },
        { type: 'body' },
      ),
    ).toThrow();
  });

  it('should return value on genreId valid', () => {
    expect(bodyPipe.transform(TestDTO, { type: 'body' }));
  });
});
