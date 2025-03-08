import { Test, TestingModule } from '@nestjs/testing';
import { DiscordOauthCallbackController } from './discord-oauth-callback.controller';

xdescribe('DiscordOauthCallbackController', () => {
  let controller: DiscordOauthCallbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordOauthCallbackController]
    }).compile();

    controller = module.get<DiscordOauthCallbackController>(DiscordOauthCallbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
