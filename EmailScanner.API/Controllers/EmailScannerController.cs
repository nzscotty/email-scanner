using Microsoft.AspNetCore.Mvc;
using EmailScanner.API.Models;
using EmailScanner.API.Services;

namespace EmailScanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailScannerController : ControllerBase
{
    private readonly EmailScannerService _scannerService;
    private readonly ILogger<EmailScannerController> _logger;

    public EmailScannerController(EmailScannerService scannerService, ILogger<EmailScannerController> logger)
    {
        _scannerService = scannerService;
        _logger = logger;
    }

    [HttpOptions]
    public ActionResult PreflightRoute()
    {
        return NoContent();
    }

    // Simple GET so health checks / browser navigation can verify the service is up.
    [HttpGet]
    public ActionResult Get()
    {
        _logger.LogInformation("GET request received at: {time}", DateTimeOffset.UtcNow);
        return Ok(new { status = "OK", message = "Email scanner service is running" });
    }

    [HttpPost]
    public ActionResult<EmailData> Scan([FromBody] ScanRequest request)
    {
        _logger.LogInformation("POST request received at: {time}", DateTimeOffset.UtcNow);
        try
        {
            var result = _scannerService.ScanEmailText(request.EmailText);
            _logger.LogInformation("Successfully scanned email data");
            return Ok(result);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while scanning email");
            return StatusCode(500, new { error = "An unexpected error occurred" });
        }
    }
}