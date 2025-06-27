import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Visibility } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'Updated Document Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '<p>Updated content</p>' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: Visibility, example: Visibility.PRIVATE })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
