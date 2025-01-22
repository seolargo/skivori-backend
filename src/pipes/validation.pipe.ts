import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Add your custom validation logic here
    if (!value) {
      throw new BadRequestException('Validation failed: No data provided');
    }

    // Example: Validate that the value is a number
    if (metadata.type === 'param' && isNaN(Number(value))) {
      throw new BadRequestException('Validation failed: ID must be a number');
    }

    // Return the validated value
    return value;
  }
}