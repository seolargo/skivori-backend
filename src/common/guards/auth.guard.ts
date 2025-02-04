import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * An authentication guard that "validates JWT tokens".
 * 
 * This guard intercepts requests, checks for a valid `Authorization` header, verifies the provided JWT token,
 * and attaches the decoded token payload to the request object for further use in the application.
 * 
 * @example
 * ```typescript
 * import { Controller, UseGuards, Get } from '@nestjs/common';
 * import { AuthGuard } from './auth.guard';
 * 
 * @Controller('protected')
 * export class ProtectedController {
 *   @Get()
 *   @UseGuards(AuthGuard)
 *   getProtectedResource() {
 *     return { message: 'This is a protected resource' };
 *   }
 * }
 * ```
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Creates an instance of `AuthGuard`.
   * 
   * @param {JwtService} jwtService - Service for verifying JWT tokens.
   */
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Determines whether the current request can proceed based on the validity of the JWT token.
   * 
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @returns {boolean} - `true` if the token is valid, otherwise `false`.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check if the Authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Deny access if the Authorization header is invalid or missing
      return false; 
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1]; 
    try {
      // Verify the JWT token and attach the decoded payload to the request object
      const decoded = this.jwtService.verify(token); 
      request.user = decoded;

      // Allow the request to proceed
      return true; 
    } catch {
      // Deny access if the token is invalid or verification fails
      return false; 
    }
  }
}
