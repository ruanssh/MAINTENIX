import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
    private readonly mail: MailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.active)
      throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const access_token = await this.jwt.signAsync({
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
    });

    return { access_token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const temporaryPassword = this.generateTemporaryPassword();
    const user = await this.users.resetPasswordByEmail(
      dto.email,
      temporaryPassword,
    );

    try {
      await this.mail.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        temporaryPassword,
      });
    } catch (error) {
      throw new InternalServerErrorException('Falha ao enviar email');
    }

    return { success: true };
  }

  private generateTemporaryPassword() {
    const bytes = randomBytes(4);
    const value = bytes.readUInt32BE(0);
    return (value % 1_000_000).toString().padStart(6, '0');
  }
}
