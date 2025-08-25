import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class CookieAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies["auth_token"];

    if (!token) {
      throw new UnauthorizedException("No authentication token found");
    }

    // Add the token to the request headers so that the JWT strategy can validate it
    request.headers.authorization = `Bearer ${token}`;

    return super.canActivate(context);
  }
}
