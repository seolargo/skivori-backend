import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

/**
 * A global exception filter to handle all uncaught exceptions in the application.
 * 
 * This filter catches both "HTTP exceptions" and "unknown exceptions", 
 * providing "a unified structure for error responses" sent to the client. 
 * It logs the exception details to the console for debugging and returns an appropriate HTTP response.
 * 
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { APP_FILTER } from '@nestjs/core';
 * import { AllExceptionsFilter } from './all-exceptions.filter';
 * 
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_FILTER,
 *       useClass: AllExceptionsFilter,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * Method to handle exceptions and send a structured response to the client.
   * 
   * @param {unknown} exception - The exception object that was thrown.
   * @param {ArgumentsHost} host - Provides access to the arguments being passed
   * to the handler, such as the HTTP response object.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Determine the HTTP status code based on the exception type
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract the message from the exception or use a generic error message
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the exception for debugging purposes
    console.error('Exception occurred:', exception);

    // Send a structured JSON response to the client
    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
