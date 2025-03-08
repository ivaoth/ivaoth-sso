import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMemberController } from './update-member.controller.js';

xdescribe('UpdateMemberController', () => {
  let controller: UpdateMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateMemberController]
    }).compile();

    controller = module.get<UpdateMemberController>(UpdateMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
