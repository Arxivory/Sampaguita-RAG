import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials inside Core API configurations.');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });
  }

  async signUp(email: string, password: string, fullName: string, role: string, facility: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new BadRequestException(error.message);
    if (!data.user) throw new BadRequestException('User registration yielded an empty authentication profile.');

    try {
      const newUserProfile = await this.prisma.client.user.create({
        data: {
          id: data.user.id,
          email: email.toLowerCase().trim(),
          fullName,
          role,
          facility,
        },
      });

      return {
        success: true,
        message: 'Account provisioned and synchronized successfully.',
        userId: newUserProfile.id,
        email: newUserProfile.email,
      };
    } catch (dbError) {
      console.error('[Auth Sync Crash] Failed writing profile data to local PostgreSQL:', dbError);
      throw new BadRequestException('Authentication entry created, but database profile replication failed.');
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException('Invalid login credentials provided.');
    if (!data.session) throw new UnauthorizedException('Failed to establish a secure user session token context.');

    return {
      success: true,
      message: 'Authentication session verified.',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        user: {
          id: data.user.id,
          email: data.user.email,
        }
      }
    };
  }
}