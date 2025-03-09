import { Test, TestingModule } from '@nestjs/testing';
import { IvaoLoginController } from './ivao-login.controller.js';

xdescribe('IvaoLoginController', () => {
  let controller: IvaoLoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IvaoLoginController]
    }).compile();

    controller = module.get<IvaoLoginController>(IvaoLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
