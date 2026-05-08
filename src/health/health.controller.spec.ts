import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthModule } from './health.module';
import { JwtGuard } from '@/auth/jwt/jwt.guard';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HealthModule],
      controllers: [HealthController],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActive: () => true })
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
