import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '@/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { randomUUID } from 'crypto';

describe('PostService', () => {
  let service: PostService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const authorId = randomUUID();
  const id = randomUUID();

  const createPost = {
    title: 'My First Post',
    content: 'Post content',
    published: false,
  };

  const post = {
    id,
    ...createPost,
    authorId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const author = {
    id: authorId,
    username: 'johndoe',
    email: 'john@example.com',
  };

  it('should find all published posts', async () => {
    prismaMock.post.findMany.mockResolvedValue([post]);

    const result = await service.findAllPublished();
    expect(result).toEqual([post]);
    expect(prismaMock.post.findMany).toHaveBeenCalledWith({
      where: { published: true },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  });

  it('should find all posts', async () => {
    prismaMock.post.findMany.mockResolvedValue([post]);

    const result = await service.findAll();
    expect(result).toEqual([post]);
    expect(prismaMock.post.findMany).toHaveBeenCalled();
  });

  it('should find one post', async () => {
    prismaMock.post.findUnique.mockResolvedValue(post);

    const result = await service.findOne(id);
    expect(result).toEqual(post);
    expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  });

  it('should find posts by author', async () => {
    prismaMock.post.findMany.mockResolvedValue([post]);

    const result = await service.findByAuthor(authorId);
    expect(result).toEqual([post]);
    expect(prismaMock.post.findMany).toHaveBeenCalledWith({
      where: { authorId },
      include: {
        author: { select: { id: true, username: true, email: true } },
      },
    });
  });

  it('should throw an error for invalid UUID', async () => {
    const invalidId = 'invalid-uuid';
    await expect(service.findOne(invalidId)).rejects.toThrow('Invalid UUID');
    expect(prismaMock.post.findUnique).not.toHaveBeenCalled();
  });

  it('should create a post', async () => {
    prismaMock.post.create.mockResolvedValue(post);
    const result = await service.create(createPost, authorId);
    expect(result).toEqual(post);
    expect(prismaMock.post.create).toHaveBeenCalledWith({
      data: { ...createPost, authorId },
    });
  });

  it('should delete a post', async () => {
    prismaMock.post.delete.mockResolvedValue(post);
    const result = await service.delete(id);
    expect(result).toEqual(post);
    expect(prismaMock.post.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should update a post', async () => {
    const updateData = { title: 'Updated Title' };
    const updatedPost = { ...post, ...updateData };
    prismaMock.post.update.mockResolvedValue(updatedPost);

    const result = await service.update(id, updateData);
    expect(result).toEqual(updatedPost);
    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id },
      data: updateData,
    });
  });
});
