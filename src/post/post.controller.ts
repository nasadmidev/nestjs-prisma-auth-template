import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Put,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import type { RequestAuthorized } from '@/auth/auth.service';
import { CreatePostDTO, UpdatePostDTO } from './post.dto';
import { Roles } from '@/auth/roles/role.decorator';
import { Role } from '@/generated/prisma/browser';
import { UuidValidatorPipe } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Public } from '@/auth/jwt/public.decorator';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiResponse({ status: 200, description: 'List of published posts' })
  async getAllPublishedPosts() {
    return await this.postService.findAllPublished();
  }

  @Get('all')
  @Roles(Role['ADMIN'])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all posts (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all posts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getAllPosts() {
    return await this.postService.findAll();
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user posts' })
  @ApiResponse({ status: 200, description: 'List of user posts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyPosts(@Req() req: RequestAuthorized) {
    const { user } = req;
    return await this.postService.findByAuthor(user.sub);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get published post by ID' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 200, description: 'Post data' })
  @ApiResponse({ status: 404, description: 'Post not found or not published' })
  async getPostById(@Param('id', new UuidValidatorPipe()) id: string) {
    return await this.postService.findOnePublished(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPost(@Req() req: RequestAuthorized, @Body() data: CreatePostDTO) {
    const { user } = req;
    return await this.postService.create(data, user.sub);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update post by ID' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @Param('id', new UuidValidatorPipe()) id: string,
    @Body() data: UpdatePostDTO,
  ) {
    return await this.postService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete post by ID' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(@Param('id', new UuidValidatorPipe()) id: string) {
    return await this.postService.delete(id);
  }
}
