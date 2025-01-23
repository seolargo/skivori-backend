import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object (DTO) for querying games.
 * This class validates and transforms the query parameters received in API requests.
 */
export class GetGamesQueryDto {
  /**
   * The search query string used to filter games.
   * 
   * @example "adventure"
   * @optional
   * @type {string}
   */
  @IsOptional() // Parameter is optional
  @IsString() // Must be a string
  search?: string;

  /**
   * The page number for pagination.
   * This determines which page of results to return.
   * 
   * @example 1
   * @optional
   * @type {number}
   */
  @IsOptional()
  @Type(() => Number) // Transform string to number
  @IsInt() // Must be an integer
  @Min(1) // Must be at least 1
  page?: number;

  /**
   * The maximum number of results to return per page.
   * 
   * @example 10
   * @optional
   * @type {number}
   */
  @IsOptional()
  @Type(() => Number) // Transform string to number
  @IsInt()
  @Min(1)
  limit?: number;
}
