import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreatePostDTO {
  @ApiProperty({
    description: 'Post title',
    example: 'My First Post',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Post content',
    example: 'This is the content of my post',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Whether the post is published',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

export class UpdatePostDTO extends PartialType(CreatePostDTO) {}