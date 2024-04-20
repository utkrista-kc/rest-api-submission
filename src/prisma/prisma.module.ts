import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useValue: PrismaService.getInstance(), //Class or test file that injects prismaService as a dependency, will only get a single instance
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
