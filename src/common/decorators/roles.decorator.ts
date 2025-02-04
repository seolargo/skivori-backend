import { SetMetadata } from '@nestjs/common';

/**
 * The @Roles() decorator attaches "role-based metadata" to "routes" or "controllers", 
 * which can be checked by guards like "RolesGuard" to enforce access control.
 * 
 * @example
 * ```typescript
 * @Roles('admin', 'user')
 * @Get('dashboard')
 * getDashboard() {
 *   return 'Welcome to the dashboard!';
 * }
 * ```
 * 
 * @param {...string[]} roles - List of roles allowed to access the resource.
 * @returns {CustomDecorator} A custom decorator with the roles metadata.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
