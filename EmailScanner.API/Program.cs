using EmailScanner.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add detailed logging
builder.Logging.AddFilter("Microsoft.AspNetCore.Cors", LogLevel.Debug);
builder.Logging.AddFilter("Microsoft.AspNetCore.Hosting", LogLevel.Debug);
builder.Logging.AddConsole();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register the EmailScannerService
builder.Services.AddScoped<EmailScannerService>();

// Configure CORS for GitHub Codespaces
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add CORS middleware first - before any auth or endpoint handling
app.UseCors();

// Only enable HTTPS redirection if an HTTPS port is configured
var httpsPort = Environment.GetEnvironmentVariable("5000");
if (!string.IsNullOrEmpty(httpsPort))
{
    app.UseHttpsRedirection();
}

// app.UseAuthorization();
app.MapControllers();

app.Run();
