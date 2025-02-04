import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Global interceptor for validating request parameters, query strings, and body content.
 * 
 * This interceptor checks all incoming HTTP requests to ensure that none of the
 * parameters, query strings, or body fields are `null` or `undefined`.
 * If any invalid value is found, it throws a `BadRequestException` with a descriptive message.
 * 
 * @class GlobalParamValidationInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class GlobalParamValidationInterceptor implements NestInterceptor {
    /**
     * Intercepts incoming HTTP requests to validate parameters, query, and body data.
     *
     * @param {ExecutionContext} context - Provides details about the current request execution context.
     * @param {CallHandler} next - Controls the flow of the request to the next handler in the pipeline.
     * @returns {Observable<any>} - Returns an observable that can be further processed in the pipeline.
     * 
     * @throws {BadRequestException} - Thrown if any parameter, query, or body field is `null` or `undefined`.
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { params, query, body } = request;

        /**
         * Checks if a value is null or undefined.
         *
         * @param {any} value - The value to validate.
         * @returns {boolean} - Returns `true` if the value is `null` or `undefined`, otherwise `false`.
         */
        const isInvalid = (value: any) =>
            value === null || value === undefined;

        /**
         * Validates parameters from the request source (query, body, or params).
         *
         * @param {Record<string, any>} parameters - The parameters to validate.
         * @param {string} source - The source of the parameters (e.g., 'query', 'body', 'params').
         * @throws {BadRequestException} - If any parameter is invalid.
         */
        const validateParameters = (parameters: Record<string, any>, source: string) => {
            for (const [key, value] of Object.entries(parameters)) {
                if (isInvalid(value)) {
                    throw new BadRequestException(
                        `Parameter '${key}' from ${source} cannot be null or undefined.`,
                    );
                }
            }
        };

        // Validate query, body, and params
        validateParameters(query, 'query');
        validateParameters(body, 'body');
        validateParameters(params, 'params');

        // Continue with the request if all parameters are valid
        return next.handle().pipe(
            map((data) => {
                // Optional: Transform the response if needed
                return data;
            }),
        );
    }
}
