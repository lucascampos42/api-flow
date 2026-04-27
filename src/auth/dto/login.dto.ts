import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'E-mail, nome de usuário ou CPF do usuário',
  })
  @IsString()
  @IsNotEmpty()
  identifier!: string; // Pode ser email, username ou CPF

  @ApiProperty({ example: '123456', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
