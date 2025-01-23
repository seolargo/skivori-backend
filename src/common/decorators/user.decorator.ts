import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the `user` object from the HTTP request.
 * 
 * This decorator can be used in controllers to access the authenticated user's details
 * without manually extracting it from the request object.
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * getUserProfile(@User() user: any) {
 *   return user;
 * }
 * ```
 */
export const User = createParamDecorator(
  /**
   * Extracts the `user` object from the request.
   * 
   * @param {unknown} data - Additional data passed to the decorator (not used here).
   * @param {ExecutionContext} ctx - The execution context, which provides access to the request.
   * @returns {any} The `user` object extracted from the request.
   */
  (data: unknown, ctx: ExecutionContext): any => {
    // Access the HTTP request
    const request = ctx.switchToHttp().getRequest();
    // Return the user object from the request 
    return request.user; 
  },
);
