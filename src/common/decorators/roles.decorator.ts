import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to define roles required for accessing a route or resource.
 * 
 * This decorator can be applied to controller methods or classes to specify the roles
 * that are allowed to access the resource. The `roles` metadata can then be checked
 * by a guard to enforce role-based access control.
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
