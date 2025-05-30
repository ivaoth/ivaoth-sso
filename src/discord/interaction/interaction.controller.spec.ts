import { Test, TestingModule } from '@nestjs/testing';
import { InteractionController } from './interaction.controller.js';

describe('InteractionController', () => {
  let controller: InteractionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionController]
    }).compile();

    controller = module.get<InteractionController>(InteractionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
