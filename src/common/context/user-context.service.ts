import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class UserContextService {
  private static readonly storage = new AsyncLocalStorage<{ userId: string }>();

  run(userId: string, callback: () => void) {
    UserContextService.storage.run({ userId }, callback);
  }

  getUserId(): string | null {
    return UserContextService.storage.getStore()?.userId || null;
  }
}
