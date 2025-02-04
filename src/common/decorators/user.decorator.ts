import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 
 * The @User() decorator extracts the authenticated user object from the HTTP request, 
 * allowing easy access to user details in controller methods without manually referencing req.user.
 * 
 * Without @User(): You’d manually do req.user in every route.
 * With @User(): Clean, reusable, and reduces boilerplate code.
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
