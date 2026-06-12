import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private sessionCache = new Map<string, { user: { id: string; email: string; role?: string }; expiresAt: number }>();
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';

    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.error('[Configuration Error] Core API is missing SUPABASE_URL or SUPABASE_ANON_KEY variables.');
    }
  }
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization bearer token framework.');
    }

    const token = authHeader.split(' ')[1];

    const cachedSession = this.sessionCache.get(token);
    if (cachedSession && Date.now() < cachedSession.expiresAt) {
      request.user = cachedSession.user;
      return true;
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ApiKey': this.supabaseAnonKey,
          'X-Client-IP': request.ip || '',
          'User-Agent': request.headers['user-agent'] || ''
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Invalid or expired remote user security session context.');
      }

      const supabaseUser = await response.json();
      
      request.user = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: supabaseUser.role || 'user',
      };

      this.sessionCache.set(token, {
        user: request.user,
        expiresAt: Date.now() + 120000,
      });

      return true;
    } catch (error) {
      console.error('[Remote Auth Sync Error]:', error.message);
      throw new UnauthorizedException('Remote token signature validation failed or identity server unreachable.');
    }
  }
}