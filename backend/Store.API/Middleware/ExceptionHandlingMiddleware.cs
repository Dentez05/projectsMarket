namespace Store.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                if (context.Response.HasStarted)
                    throw;
                await HandleAsync(context, ex);
            }
        }

        private async Task HandleAsync(HttpContext context, Exception ex)
        {
            var (status, message) = ex switch
            {
                UnauthorizedAccessException e => (StatusCodes.Status403Forbidden, e.Message),
                ArgumentException e => (StatusCodes.Status400BadRequest, e.Message),
                InvalidOperationException e => (StatusCodes.Status400BadRequest, e.Message),
                BadHttpRequestException e => (StatusCodes.Status400BadRequest, e.Message),
                _ => (StatusCodes.Status500InternalServerError,
                      _env.IsDevelopment() ? ex.Message : "Внутренняя ошибка сервера")
            };

            if (status == StatusCodes.Status500InternalServerError)
                _logger.LogError(ex, "Необработанная ошибка: {Method} {Path}",
                    context.Request.Method, context.Request.Path);
            else
                _logger.LogWarning(ex, "Ошибка запроса {Status}: {Method} {Path}",
                    status, context.Request.Method, context.Request.Path);

            context.Response.Clear();
            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(new { message });
        }
    }
}
