1. We have a simple architecture
Request → Controller → Handler → Response

2. We are extending this with interceptors
Request → Controller → Interceptor (pre-handler) → Handler → Interceptor (post-handler) → Response

3. We are extending this with middlewares
Request → Middleware (pre-processing) → Controller → Interceptor (pre-handler) → Handler → Interceptor (post-handler) → Middleware (after-processing) → Response

The general approach is this:
Request → Middleware (pre-processing) → Controller → Interceptor (pre-handler) → Handler → Interceptor (post-handler) → Response

We also use interceptors in the frameworks like Angular!


- Middleware: Processes incoming HTTP requests before they reach the controller, handling tasks like logging, authentication, or request modification.
- Controller: Defines routes and handles incoming requests, delegating them to the appropriate service or handler.
- Interceptor: Wraps around method execution to handle cross-cutting concerns like logging, transforming requests/responses, or error handling before and after the handler runs.
- Handler: Executes the core business logic for a specific request, such as querying a database or processing data. (TR: Asıl işi yapan)