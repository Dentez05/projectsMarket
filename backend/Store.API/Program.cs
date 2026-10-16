using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Store.API.Data;
using Store.API.Middleware;
using Store.API.Repositories;
using Store.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 524288000; // 500MB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 524288000; // 500MB
});

builder.Services.AddDbContext<StoreDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddHttpClient();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Email: log (заглушка в лог, по умолчанию) | smtp (MailKit, Smtp__* в .env)
if (string.Equals(builder.Configuration["Email:Provider"], "smtp", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddScoped<Store.API.Email.IEmailService, Store.API.Email.SmtpEmailService>();
else
    builder.Services.AddScoped<Store.API.Email.IEmailService, Store.API.Email.LoggingEmailService>();

builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();

builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPromoCodeService, PromoCodeService>();

// JWT-ключ обязателен: без fallback-секрета в коде
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
    throw new InvalidOperationException(
        "Jwt:Key не задан или короче 32 символов. Задайте переменную окружения Jwt__Key (см. .env.example).");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "projectsmarket-api",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "projectsmarket-client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // SignalR не может передать JWT в заголовке — хаб читает токен из query access_token
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    context.Token = accessToken;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddSignalR();
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// CORS:origins из конфига (Cors__Origins)
var corsOrigins = (builder.Configuration["Cors:Origins"]
        ?? "http://localhost:5010,http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Реальный IP клиента за nginx/gateway
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor
                             | ForwardedHeaders.XForwardedProto
                             | ForwardedHeaders.XForwardedHost;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Store.API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Введите токен: Bearer {ваш_токен}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


var app = builder.Build();

app.UseForwardedHeaders();
app.UseMiddleware<ExceptionHandlingMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
    db.Database.Migrate();

    // Старые файлы из wwwroot/uploads переносим в приватное хранилище (отдавались статикой без авторизации)
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
    var legacyFiles = db.ProjectFiles
        .Where(f => f.FilePath.StartsWith("/uploads/"))
        .ToList();

    foreach (var file in legacyFiles)
    {
        var relative = file.FilePath.TrimStart('/');
        var source = Path.Combine(env.WebRootPath, relative);
        if (!System.IO.File.Exists(source))
            continue;

        var privateRelative = relative.Replace("uploads/", "uploads-private/", StringComparison.Ordinal);
        var target = Path.Combine(env.ContentRootPath, privateRelative);
        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        System.IO.File.Move(source, target, overwrite: true);

        file.FilePath = "/" + privateRelative;
        app.Logger.LogInformation("Файл проекта {ProjectId} перенесён в приватное хранилище: {Path}", file.ProjectId, file.FilePath);
    }

    if (legacyFiles.Count > 0)
        db.SaveChanges();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000");
    }
});

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<Store.API.Hubs.SupportHub>("/hubs/support");

app.MapGet("/health", async (StoreDbContext db) =>
{
    IResult result = await db.Database.CanConnectAsync()
        ? Results.Ok(new { status = "healthy" })
        : Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    return result;
});

app.MapGet("/sitemap.xml", async (StoreDbContext db, IConfiguration config) =>
{
    var baseUrl = (config["App:BaseUrl"] ?? "http://localhost:5010").TrimEnd('/');
    var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

    var projectIds = await db.Projects
        .Where(p => p.Status == "Active")
        .OrderBy(p => p.Id)
        .Select(p => p.Id)
        .ToListAsync();

    var sb = new System.Text.StringBuilder();
    sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
    foreach (var (path, priority) in new[]
    {
        ("/", "1.0"),
        ("/projects", "0.9"),
    })
    {
        sb.AppendLine($"  <url><loc>{baseUrl}{path}</loc><lastmod>{today}</lastmod><priority>{priority}</priority></url>");
    }
    foreach (var id in projectIds)
    {
        sb.AppendLine($"  <url><loc>{baseUrl}/projects/{id}</loc><lastmod>{today}</lastmod><priority>0.8</priority></url>");
    }
    sb.AppendLine("</urlset>");

    return Results.Content(sb.ToString(), "application/xml", System.Text.Encoding.UTF8);
}).AllowAnonymous();

app.Run();
