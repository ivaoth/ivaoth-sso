import { Test, TestingModule } from '@nestjs/testing';
import { DiscordApiService } from './discord-api.service.js';

xdescribe('DiscordApiService', () => {
  let service: DiscordApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordApiService]
    }).compile();

    service = module.get<DiscordApiService>(DiscordApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
