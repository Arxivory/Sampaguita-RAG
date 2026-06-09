import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET') || '';
    if (!this.jwtSecret) {
      console.warn('[Security Warning] SUPABASE_JWT_SECRET is unassigned inside your configuration setup.');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization bearer token framework.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedPayload = jwt.verify(token, this.jwtSecret) as any;
      
      request.user = {
        id: decodedPayload.sub,
        email: decodedPayload.email,
        role: decodedPayload.role,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication token signature verification failed or token expired.');
    }
  }
}