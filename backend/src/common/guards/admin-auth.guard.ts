import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt-admin') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  handleRequest(err, user) {
    if (err || !user) throw err || new UnauthorizedException('Admin authentication required');
    if (!['admin', 'super_admin'].includes(user.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return user;
  }
}
