import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'Document'))
  create(@Request() req, @Body() dto: CreateDocumentDto) {
    console.log(req);
    return this.documentsService.create(req.user.userId, dto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'Document'))
  findAll(@Request() req) {
    return this.documentsService.findAllAccessible(req.user.userId);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can('read', 'Document'))
  findOne(@Request() req, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('update', 'Document'))
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('delete', 'Document'))
  remove(@Request() req, @Param('id') id: string) {
    return this.documentsService.remove(req.user.userId, id);
  }
}
