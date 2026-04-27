import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RevendasService } from './revendas.service';
import { CreateRevendaDto } from './dto/create-revenda.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/casl-ability.factory';

@ApiTags('Revendas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('revendas')
export class RevendasController {
  constructor(private readonly revendasService: RevendasService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Revenda'))
  @ApiOperation({ summary: 'Criar uma nova revenda e provisionar schema' })
  create(@Body() createRevendaDto: CreateRevendaDto) {
    return this.revendasService.create(createRevendaDto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Revenda'))
  @ApiOperation({ summary: 'Listar todas as revendas' })
  findAll() {
    return this.revendasService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Revenda'))
  @ApiOperation({ summary: 'Obter detalhes de uma revenda' })
  findOne(@Param('id') id: string) {
    return this.revendasService.findOne(id);
  }
}
