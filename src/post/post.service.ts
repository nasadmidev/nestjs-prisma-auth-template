import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { validateUUID } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { CreatePostDTO, UpdatePostDTO } from './post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.post.findMany({
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findAllPublished() {
    return await this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    validateUUID(id);
    return await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findOnePublished(id: string) {
    validateUUID(id);
    return await this.prisma.post.findUnique({
      where: { id, published: true },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findByAuthor(authorId: string) {
    validateUUID(authorId);
    return await this.prisma.post.findMany({
      where: { authorId },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async create(data: CreatePostDTO, authorId: string) {
    return await this.prisma.post.create({
      data: { ...data, authorId },
    });
  }

  async update(id: string, data: UpdatePostDTO) {
    validateUUID(id);
    return await this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    validateUUID(id);
    return await this.prisma.post.delete({
      where: { id },
    });
  }
}
