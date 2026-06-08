import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} could not be located.`);
    return user;
  }

  async findAll() {
    return await this.prisma.client.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    
    if (!user) {
      console.warn(`[Pipeline Safe-Catch] User ${id} not found in database. Auto-provisioning sample TEST user profile.`);
      try {
        await this.prisma.client.user.create({
          data: {
            id,
            email: `mock-clinician-${id.slice(0, 5)}@sampaguita.gov.ph`,
            fullName: 'Dr. Auto Provisioned Sandbox Handler',
            role: 'MHO',
            facility: 'Pavia Municipal Health Unit - Sandbox',
          },
        });
      } catch (err) {
        console.error('Failed to provision safe-catch sandbox user profile:', err);
        throw new InternalServerErrorException('Database constraint management initialization failed.');
      }
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.client.user.delete({ where: { id } });
  }
}