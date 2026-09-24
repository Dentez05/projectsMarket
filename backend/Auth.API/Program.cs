using Auth.API.Data;
using Auth.API.Models.Entities;
using Auth.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5010",
                "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

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
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowReact");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var loginAttempts = new ConcurrentDictionary<string, (int Count, DateTime WindowStart)>();
const int MaxLoginAttempts = 10;
const int WindowMinutes = 5;

app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower() ?? "";
    if ((path.Contains("/api/auth/login") || path.Contains("/api/auth/register"))
        && context.Request.Method == "POST")
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var now = DateTime.UtcNow;
        var key = $"{ip}:{(path.Contains("login") ? "login" : "register")}";

        var entry = loginAttempts.AddOrUpdate(key,
            _ => (1, now),
            (_, existing) =>
            {
                if ((now - existing.WindowStart).TotalMinutes > WindowMinutes)
                    return (1, now);
                existing.Count++;
                return existing;
            });

        if (entry.Count > MaxLoginAttempts)
        {
            context.Response.StatusCode = 429;
            await context.Response.WriteAsJsonAsync(new { message = "Слишком много попыток. Попробуйте через 5 минут." });
            return;
        }
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    dbContext.Database.Migrate();

    if (!dbContext.Users.Any(u => u.Role == "Admin"))
    {
        var admin = new User
        {
            Email = "admin@projectsmarket.ru",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"),
            FullName = "Администратор",
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Users.Add(admin);
        dbContext.SaveChanges();

        Console.WriteLine("==========================================");
        Console.WriteLine("Создан администратор:");
        Console.WriteLine("Email: admin@projectsmarket.ru");
        Console.WriteLine("Пароль: Admin123");
        Console.WriteLine("==========================================");
    }
}

app.Run();