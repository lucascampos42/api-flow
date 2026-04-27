import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RevendasService } from './revendas.service';
import { CreateRevendaDto } from './dto/create-revenda.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Revendas')
@Controller('revendas')
export class RevendasController {
  constructor(private readonly revendasService: RevendasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova revenda e provisionar schema' })
  create(@Body() createRevendaDto: CreateRevendaDto) {
    return this.revendasService.create(createRevendaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as revendas' })
  findAll() {
    return this.revendasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma revenda' })
  findOne(@Param('id') id: string) {
    return this.revendasService.findOne(id);
  }
}
