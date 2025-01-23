import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * A custom validation pipe for validating request payloads using `class-validator` and `class-transformer`.
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
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    // Skip validation if no metadata type is provided or if the type doesn't require validation
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
