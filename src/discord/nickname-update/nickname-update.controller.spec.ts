import { Test, TestingModule } from '@nestjs/testing';
import { NicknameUpdateController } from './nickname-update.controller.js';

xdescribe('NicknameUpdateController', () => {
  let controller: NicknameUpdateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NicknameUpdateController]
    }).compile();

    controller = module.get<NicknameUpdateController>(NicknameUpdateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
