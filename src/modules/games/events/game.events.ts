/**
 * Event triggered when the games cache is refreshed.
 */
export class CacheRefreshedEvent {
  /**
   * The number of games present in the refreshed cache.
   */
  count!: number;

  /**
   * Constructs a new `CacheRefreshedEvent` instance.
   *
   * @param {Partial<CacheRefreshedEvent>} partial - A partial object to initialize the event properties.
   */
  constructor(partial: Partial<CacheRefreshedEvent>) {
    Object.assign(this, partial);
  }
}

/**
 * Event triggered when a search is performed.
 */
export class SearchPerformedEvent {
  /**
   * The search query performed by the user.
   */
  query!: string;

  /**
   * The number of results returned for the search query.
   */
  resultCount!: number;

  /**
   * The page number of the search results.
   */
  page!: number;

  /**
   * The limit of results per page.
   */
  limit!: number;

  /**
   * Constructs a new `SearchPerformedEvent` instance.
   *
   * @param {Partial<SearchPerformedEvent>} partial - A partial object to initialize the event properties.
   */
  constructor(partial: Partial<SearchPerformedEvent>) {
    Object.assign(this, partial);
  }
}
