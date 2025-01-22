export class CacheRefreshedEvent {
  count!: number;
  
  constructor(partial: Partial<CacheRefreshedEvent>) {
    Object.assign(this, partial);
  }
}
  
export class SearchPerformedEvent {
  query!: string;
  resultCount!: number;
  page!: number;
  limit!: number;

  constructor(partial: Partial<SearchPerformedEvent>) {
    Object.assign(this, partial);
  }
}
  