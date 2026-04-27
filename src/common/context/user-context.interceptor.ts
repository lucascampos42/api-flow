import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserContextService } from './user-context.service';

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  constructor(private readonly userContext: UserContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.sub;

    if (userId) {
      return new Observable((subscriber) => {
        this.userContext.run(userId, () => {
          next.handle().subscribe(subscriber);
        });
      });
    }

    return next.handle();
  }
}
