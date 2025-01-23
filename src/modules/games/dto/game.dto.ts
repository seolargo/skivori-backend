import { Expose, Exclude } from 'class-transformer';

/**
 * Data Transfer Object (DTO) for representing game data.
 * This class is used to control the shape of the game data returned in API responses.
 */
export class GameDto {
  /**
   * The unique identifier for the game.
   * 
   * @example "playngo_legacy-of-dead"
   * @type {string}
   */
  @Expose()
  id?: string;

  /**
   * The URL-friendly slug for the game.
   * 
   * @example "playngo-legacy-of-dead"
   * @type {string}
   */
  @Expose()
  slug?: string;

  /**
   * The title of the game.
   * 
   * @example "Legacy of Dead"
   * @type {string}
   */
  @Expose()
  title?: string;

  /**
   * The name of the provider for the game.
   * This field is excluded from the API response.
   * 
   * @example "Play'n GO"
   * @type {string}
   * @private
   */
  @Exclude()
  providerName?: string;

  /**
   * The URL for the game's thumbnail image.
   * 
   * @example "//images.example.com/thumbnail.jpg"
   * @type {string}
   */
  @Expose()
  thumb?: string;

  /**
   * The URL to start playing the game.
   * 
   * @example "https://example.com/play?gameId=12345"
   * @type {string}
   */
  @Expose()
  startUrl?: string;
}
