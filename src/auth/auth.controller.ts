import {
  Body,
  Controller,
  Post,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { RefreshJwtAuthGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Realizar login e obter cookie de sessão' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user, companies, currentCompany } =
      await this.authService.login(loginDto);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      ...(isProduction && { domain: '.codesdevs.com.br' }),
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 dias
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      ...(isProduction && { domain: '.codesdevs.com.br' }),
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Login realizado com sucesso',
      access_token,
      user,
      companies,
      currentCompany,
    };
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar Access Token usando Refresh Token' })
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      ...(isProduction && { domain: '.codesdevs.com.br' }),
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      ...(isProduction && { domain: '.codesdevs.com.br' }),
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: tokens.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Encerrar sessão' })
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['userId'];
    await this.authService.logout(userId);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      ...(isProduction && { domain: '.codesdevs.com.br' }),
      path: '/',
    };

    res.clearCookie('access_token', cookieOptions as any);
    res.clearCookie('refresh_token', cookieOptions as any);

    return { message: 'Logout realizado com sucesso' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('switch-company')
  @ApiOperation({ summary: 'Trocar empresa atual do usuário' })
  async switchCompany(
    @Req() req,
    @Body() { companyId }: { companyId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user['userId'];
    const { access_token, refresh_token, currentCompany } =
      await this.authService.switchCompany(userId, companyId);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      ...(isProduction && { domain: '.codesdevs.com.br' }),
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      ...(isProduction && { domain: '.codesdevs.com.br' }),
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Empresa alterada com sucesso',
      currentCompany,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('companies-context')
  @ApiOperation({
    summary: 'Obter contexto de empresas para o usuário autenticado',
  })
  async getCompaniesContext(@Req() req) {
    const { userId, userType, revendaId, companyId } = req.user;
    return this.authService.getCompaniesContextFromJwt({
      userId,
      userType,
      revendaId,
      companyId,
    });
  }
}
