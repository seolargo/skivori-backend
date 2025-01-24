export interface GetGamesResult {
    total: number; // Total number of games that match the query
    page: number; // Current page number
    limit: number; // Number of games per page
    paginatedGames: any[]; // List of games for the current page
}
  