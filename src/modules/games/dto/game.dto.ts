import { Expose, Exclude } from 'class-transformer';

export class GameDto {
  @Expose()
  id?: string;

  @Expose()
  slug?: string;

  @Expose()
  title?: string;

  @Exclude()
  providerName?: string;

  @Expose()
  thumb?: string; // Simplify the thumbnail property

  @Expose()
  startUrl?: string; // Excluded from the response
}
