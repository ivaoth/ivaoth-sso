import { Test, TestingModule } from '@nestjs/testing';
import { SubmitConsentController } from './submit-consent.controller';

describe('SubmitConsentController', () => {
  let controller: SubmitConsentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmitConsentController]
    }).compile();

    controller = module.get<SubmitConsentController>(SubmitConsentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
