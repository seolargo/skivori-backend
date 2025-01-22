import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetGamesQueryDto {
  @IsOptional() // Parameter is optional
  @IsString() // Must be a string
  search?: string;

  @IsOptional()
  @Type(() => Number) // Transform string to number
  @IsInt() // Must be an integer
  @Min(1) // Must be at least 1
  page?: number;

  @IsOptional()
  @Type(() => Number) // Transform string to number
  @IsInt()
  @Min(1)
  limit?: number;
}
