import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { validateUUID } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string) {
    validateUUID(id);
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findOneByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserDTO) {
    const parsedData = { ...data, password: await hash(data.password, 10) };
    return await this.prisma.user.create({ data: parsedData });
  }

  async delete(id: string) {
    validateUUID(id);
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    validateUUID(id);
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
