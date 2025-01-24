import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
  
@Injectable()
export class GlobalParamValidationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { params, query, body } = request;
    
        // Function to check if a value is null or undefined
        const isInvalid = (value: any) =>
            value === null || value === undefined;
    
        // Validate all parameters in the request
        const validateParameters = (parameters: Record<string, any>, source: string) => {
            for (const [key, value] of Object.entries(parameters)) {
                if (isInvalid(value)) {
                    throw new BadRequestException(
                        `Parameter '${key}' from ${source} cannot be null, undefined.`,
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
                // You can transform the response here if needed
                return data;
            }),
        );
    }
}