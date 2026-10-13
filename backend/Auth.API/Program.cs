using Auth.API.Data;
using Auth.API.Models.Entities;
using Auth.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// CORS:origins из конфига (Cors__Origins)
var corsOrigins = (builder.Configuration["Cors:Origins"]
        ?? "http://localhost:5010,http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// JWT-ключ обязателен: без него подпись токенов недостоверна
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
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Rate limiting на вход/регистрацию: 10 попыток за 5 минут на IP (политика "auth")
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(5),
            QueueLimit = 0
        });
    });
    options.OnRejected = async (context, token) =>
    {
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Слишком много попыток. Попробуйте через 5 минут." }, token);
    };
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

builder.Services.AddScoped<IAuthService, AuthService>();

// Email: log (заглушка в лог, по умолчанию) | smtp (MailKit, Smtp__* в .env)
if (string.Equals(builder.Configuration["Email:Provider"], "smtp", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddScoped<Auth.API.Email.IEmailService, Auth.API.Email.SmtpEmailService>();
else
    builder.Services.AddScoped<Auth.API.Email.IEmailService, Auth.API.Email.LoggingEmailService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseForwardedHeaders();
app.UseRateLimiter();
app.UseCors("AllowReact");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", async (AuthDbContext db) =>
{
    IResult result = await db.Database.CanConnectAsync()
        ? Results.Ok(new { status = "healthy" })
        : Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    return result;
});

// Миграции + первый запуск: админ создаётся из конфига, а не из кода.
// Пароль в существующую запись НИКОГДА не перезаписывается.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    db.Database.Migrate();

    if (!db.Users.Any(u => u.Role == "Admin"))
    {
        var adminEmail = app.Configuration["Admin:Email"];
        var adminPassword = app.Configuration["Admin:Password"];
        var generatedPassword = false;

        if (string.IsNullOrWhiteSpace(adminEmail))
            adminEmail = "admin@projectsmarket.ru";

        if (string.IsNullOrWhiteSpace(adminPassword))
        {
            adminPassword = GenerateSecurePassword(16);
            generatedPassword = true;
        }
        else if (adminPassword.Length < 12)
        {
            throw new InvalidOperationException(
                "Admin:Password должен быть не короче 12 символов.");
        }

        if (db.Users.Any(u => u.Email == adminEmail))
        {
            Console.WriteLine("==========================================");
            Console.WriteLine($"ВНИМАНИЕ: пользователь {adminEmail} уже существует,");
            Console.WriteLine("но не администратор. Роль назначается вручную в БД:");
            Console.WriteLine($"  UPDATE users SET role = 'Admin' WHERE email = '{adminEmail}';");
            Console.WriteLine("==========================================");
        }
        else
        {
            var admin = new User
            {
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                FullName = "Администратор",
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(admin);
            db.SaveChanges();

            // Сгенерированный пароль показываем ровно один раз, иначе войти невозможно.
            // Заданный в .env оператор и так знает.
            Console.WriteLine("==========================================");
            Console.WriteLine("Создан администратор:");
            Console.WriteLine($"Email: {adminEmail}");
            if (generatedPassword)
                Console.WriteLine($"Пароль (сохраните, показывается один раз): {adminPassword}");
            else
                Console.WriteLine("Пароль: из переменной окружения Admin__Password");
            Console.WriteLine("==========================================");
        }
    }
}

app.Run();

static string GenerateSecurePassword(int length)
{
    const string lower = "abcdefghijkmnopqrstuvwxyz";
    const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const string digits = "23456789";
    const string special = "!@#$%^&*()-_=+";
    var all = lower + upper + digits + special;

    var chars = new char[length];
    chars[0] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
    chars[1] = digits[RandomNumberGenerator.GetInt32(digits.Length)];
    chars[2] = special[RandomNumberGenerator.GetInt32(special.Length)];
    for (var i = 3; i < length; i++)
        chars[i] = all[RandomNumberGenerator.GetInt32(all.Length)];

    for (var i = length - 1; i > 0; i--)
    {
        var j = RandomNumberGenerator.GetInt32(i + 1);
        (chars[i], chars[j]) = (chars[j], chars[i]);
    }

    return new string(chars);
}
