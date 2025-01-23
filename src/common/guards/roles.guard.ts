import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * A guard that enforces role-based access control.
 * 
 * The `RolesGuard` checks if the user making a request has the necessary roles to access a particular route or resource.
 * Roles are defined using custom metadata on route handlers, and this guard validates the user's roles against them.
 * 
 * @example
 * ```typescript
 * import { Controller, Get, UseGuards } from '@nestjs/common';
 * import { Roles } from './roles.decorator';
 * import { RolesGuard } from './roles.guard';
 * 
 * @Controller('admin')
 * @UseGuards(RolesGuard)
 * export class AdminController {
 *   @Get()
 *   @Roles('admin') // Only users with the 'admin' role can access this route
 *   getAdminResource() {
 *     return { message: 'Welcome, admin!' };
 *   }
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Creates an instance of `RolesGuard`.
   * 
   * @param {Reflector} reflector - Utility for accessing custom metadata defined on route handlers.
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines whether the current request can proceed based on the user's roles.
   * 
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @returns {boolean} - `true` if the user has at least one of the required roles or if no roles are defined; otherwise, `false`.
   */
  canActivate(context: ExecutionContext): boolean {
    // Retrieve the roles defined on the route handler
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!roles) {
      // Allow access if no roles are defined
      return true; 
    }

    // Extract the request and user from the execution context
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the user's roles include at least one of the required roles
    return roles.some((role) => user.roles?.includes(role));
  }
}
