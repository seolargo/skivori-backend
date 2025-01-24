import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * A custom validation pipe for validating request payloads using `class-validator` and `class-transformer`.
 * This pipe also includes additional validations for specific fields like `searchQuery`, `page`, and `limit`.
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  /**
   * Transforms and validates the incoming request payload.
   *
   * @param {any} value - The value to be validated.
   * @param {ArgumentMetadata} metadata - The metadata about the argument being validated.
   * @returns {Promise<any>} - Returns the validated and transformed value if validation succeeds.
   * @throws {BadRequestException} - Throws an exception if validation fails.
   */
  async transform(value: any, { metatype, data }: ArgumentMetadata): Promise<any> {
    // Additional custom validations
    if (value === undefined || value === null) {
      throw new BadRequestException('Validation failed: No data provided');
    }

    // Validate `searchQuery` for proper structure
    if (data === 'searchQuery' && typeof value !== 'string') {
      throw new BadRequestException('Validation failed: Search query must be a string');
    }

    // Validate `page` as a positive integer
    if (data === 'page') {
      const page = Number(value);
      if (isNaN(page) || page <= 0 || !Number.isInteger(page)) {
        throw new BadRequestException('Validation failed: Page must be a positive integer');
      }
    }

    // Validate `limit` as a positive integer within reasonable bounds
    if (data === 'limit') {
      const limit = Number(value);
      if (isNaN(limit) || limit <= 0 || !Number.isInteger(limit) || limit > 100) {
        throw new BadRequestException('Validation failed: Limit must be a positive integer not exceeding 100');
      }
    }

    // Validate `cachedGames` for proper format
    if (data === 'cachedGames' && !Array.isArray(value)) {
      throw new BadRequestException('Validation failed: Cached games must be an array');
    }

    // Skip validation using `class-validator` if no metadata type is provided or doesn't require validation
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform the value into a class instance
    const object = plainToClass(metatype, value);

    // Validate the transformed object
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    return value;
  }

  /**
   * Determines whether a given type should be validated.
   *
   * @param {Function} metatype - The metadata type to check.
   * @returns {boolean} - Returns `true` if the type should be validated, otherwise `false`.
   */
  private toValidate(metatype: Function): boolean {
    // List of primitive types that do not require validation
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
