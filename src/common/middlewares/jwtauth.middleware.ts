import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Middleware for handling JWT authentication.
 *
 * This middleware validates the presence and validity of a JWT token
 * in the `Authorization` header. If the token is valid, the decoded payload
 * is attached to the request object. If invalid, a 401 Unauthorized response
 * is returned.
 */
@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  /**
   * Constructor to inject dependencies.
   *
   * @param jwtService - The service used to handle JWT verification.
   */
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Method to handle JWT authentication for incoming requests.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware or handler.
   */
  use(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      
      // End the request-response cycle.
      return; 
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.split(' ')[1];
    try {
      // Verify the JWT token and attach the decoded payload to the request object
      const decoded = this.jwtService.verify(token);
      req.user = decoded;

      // Pass control to the next middleware or handler.
      next(); 
    } catch (error) {
      // Respond with 401 Unauthorized if the token is invalid
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
}
