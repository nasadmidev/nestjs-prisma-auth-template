import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { Role } from '@/generated/prisma/enums';

describe('UserService', () => {
  let service: UserService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const id = randomUUID();

  const createUser = {
    username: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashed-password',
    role: Role['USER'],
  };

  const user = {
    id,
    ...createUser,
    createdAt: new Date(),
  };

  it('should find all users', async () => {
    prismaMock.user.findMany.mockResolvedValue([user]);

    const result = await service.findAll();
    expect(result).toEqual([user]);
    expect(prismaMock.user.findMany).toHaveBeenCalled();
  });

  it('should find one user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await service.findOne(id);
    expect(result).toEqual(user);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should find one user by username', async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);
    const result = await service.findOneByUsername(user.username);
    expect(result).toEqual(user);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: user.username },
    });
  });

  it('should find one user by email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);
    const result = await service.findOneByEmail(user.email);
    expect(result).toEqual(user);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it('should throw an error for invalid UUID', async () => {
    const invalidId = 'invalid-uuid';
    await expect(service.findOne(invalidId)).rejects.toThrow('Invalid UUID');
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('should create a user', async () => {
    const spyHash = jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValue('hashed-password' as never);
    prismaMock.user.create.mockResolvedValue(user);
    const result = await service.create(createUser);
    expect(result).toEqual(user);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: createUser,
    });
    expect(spyHash).toHaveBeenCalledWith(createUser.password, 10);
  });

  it('should delete a user', async () => {
    prismaMock.user.delete.mockResolvedValue(user);
    const result = await service.delete(id);
    expect(result).toEqual(user);
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should update a user', async () => {
    const updateData = { username: 'Jane Doe' };
    const updatedUser = { ...user, ...updateData };
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await service.update(id, updateData);
    expect(result).toEqual(updatedUser);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id },
      data: updateData,
    });
  });
});
