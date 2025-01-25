# NestJS Application Documentation

## Main Entry Point
### `main.ts`
The `main.ts` file serves as the entry point of the NestJS application. It initializes the application, configures middleware, and starts the server.

## Root Module
### `app.module.ts`
The `app.module.ts` file defines the root module of the NestJS application. It imports necessary modules, configures middleware, and registers global providers such as interceptors, guards, and filters.

## Custom Validation
### `validation.pipe.ts`
The `validation.pipe.ts` file defines a custom validation pipe for validating request payloads using `class-validator` and `class-transformer`. It includes additional validations for specific fields like `searchQuery`, `page`, and `limit`.

## Slot Machine Operations
### SlotService and SlotController
The `SlotService` and `SlotController` handle slot machine operations in the NestJS application, including:
- Spinning the reels and calculating rewards.
- Simulating multiple spins to analyze outcomes.
- Running Monte Carlo simulations to study the slot machine's behavior over multiple trials.
- Resetting the user's balance to its initial value.

## Game Management
### GamesService, GamesController, and GameListener
The `GamesService`, `GamesController`, and `GameListener` manage game-related operations, including:
- Loading and caching games from a JSON file.
- Searching and paginating games based on user queries.
- Handling events like cache refreshes and search analytics.

## Data Transfer Objects and Configuration
### DTOs and Configuration Files
The `GetGamesQueryDto`, `GameDto`, and `appConfig` files are utilized to:
- Validate and transform incoming request data (`GetGamesQueryDto`).
- Control the shape of API responses (`GameDto`).
- Manage application configuration (`appConfig`).

## Core Components
### Middlewares
Middlewares are functions that have access to the request and response objects, and the next middleware function in the application’s request-response cycle. They can execute code, modify request and response objects, end the cycle, or call the next middleware.

### Interceptors
Interceptors bind extra logic before or after method execution, transform results, or handle exceptions. They are useful for tasks like logging, caching, and error handling.

### Guards
Guards determine whether a request should be handled by the route handler. They are commonly used for authentication and authorization.

### Filters
Filters catch exceptions thrown by routes, controllers, or services, allowing control over the flow and content of the response sent back to the client.

### Decorators
Decorators are special declarations attached to class declarations, methods, accessors, properties, or parameters to modify their behavior. They are often used for metadata reflection and adding extra functionality.

# NestJS Application Logs Explanation

These logs show the startup process of a NestJS application. They include initializing modules, loading dependencies, building search indexes, and mapping routes. Each log entry indicates a step in the application's setup, such as loading services, initializing modules, and defining API endpoints. Once all routes are mapped and dependencies are loaded, the application starts successfully.

## Future Considerations
Even though guards or roles/user decorators are implemented, they are not currently used in the application as the project requirements do not specify their use. However, they can be utilized in the future. Other methods in the security section or other parts of NestJS are known but not implemented for simplicity.

It starts with npm run start:dev