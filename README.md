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

# Middleware Implementation for Robust REST API Endpoints

The provided middlewares address the requirement of making the REST API endpoints more robust by incorporating various functionalities to enhance security, reliability, and performance. Below is a detailed explanation of how each middleware contributes to satisfying the requirement.

## Requirement
"In the REST API endpoints, use any middleware you deem necessary to make the endpoints more robust. Clearly mark the code that addresses this."

### CachingMiddleware
- **Purpose**: Improves performance by caching responses for requests with the same method and URL.
- **Relevance**: Reduces server load by serving cached responses when available.

### ErrorHandlingMiddleware
- **Purpose**: Logs and handles errors for HTTP responses with status codes >= 400. Ensures a consistent error response for unhandled exceptions.
- **Relevance**: Makes the API more resilient by gracefully handling unexpected errors and providing meaningful error messages.

### GlobalHeaderMiddleware
- **Purpose**: Sets global HTTP headers to enhance security (e.g., Content-Security-Policy) and provide metadata (e.g., X-Powered-By).
- **Relevance**: Improves the API's security posture and consistency in headers.

### HealthCheckMiddleware
- **Purpose**: Provides a /health endpoint to monitor the application's health status.
- **Relevance**: Helps detect issues with the application by enabling health checks.

### JwtAuthMiddleware
- **Purpose**: Validates JWT tokens in the Authorization header to authenticate requests.
- **Relevance**: Secures endpoints by ensuring that only authenticated users can access them.

### LoggerMiddleware
- **Purpose**: Logs all incoming HTTP requests with their methods and URLs.
- **Relevance**: Provides transparency for API usage and aids in debugging.

### RateLimitMiddleware
- **Purpose**: Restricts the number of requests per IP to prevent abuse and protect the API from being overloaded.
- **Relevance**: Ensures availability by mitigating DoS attacks or excessive usage.

### ResponseTransformMiddleware
- **Purpose**: Wraps all outgoing responses in a consistent format (e.g., { success: true, data: ... }).
- **Relevance**: Ensures API responses follow a standardized format, improving client-side handling.

### SanitizationMiddleware
- **Purpose**: Sanitizes request data (e.g., body, query parameters) to prevent injection attacks such as XSS.
- **Relevance**: Protects the API from malicious inputs, enhancing its security.

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

It starts with "npm run start:dev"

The performance optimization are made when necessary. Terminal screen can be obserbed to see the results.


# Performance Optimization for Search Functionality

This document outlines the changes made to optimize the search functionality, both on the backend and frontend, to reduce the number of hits to the backend and improve overall performance.

---

## Backend Changes

### Caching Middleware

- **Purpose**: To reduce redundant database queries and improve response times by caching responses.
- **Implementation**: The `CachingMiddleware` intercepts incoming requests and checks if a cached response exists for the given request method and URL. If a cached response is found, it is returned immediately. Otherwise, the middleware captures the response, caches it for 60 seconds, and forwards it to the client.

## Frontend Changes

### Debouncing Search Input

- **Purpose**: To reduce the number of API calls made while the user is typing in the search bar.

- **Implementation**: A debounce function is used to delay the execution of the fetchGames function until the user has stopped typing for 500 milliseconds.

### Memoization

- **Purpose**: To optimize rendering performance by preventing unnecessary re-renders of components.

- **Implementation**: Several components and values are memoized using React.memo and useMemo to ensure they only re-render when their dependencies change.

- **Pagination**: Limits the number of items fetched and displayed at once, reducing backend load.