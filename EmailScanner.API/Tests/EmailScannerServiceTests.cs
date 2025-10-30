using EmailScanner.API.Services;
using Xunit;
namespace EmailScanner.API.Tests;

public class EmailScannerServiceTests
{
    private readonly EmailScannerService _service;

    public EmailScannerServiceTests()
    {
        _service = new EmailScannerService();
    }

    [Fact]
    public void Scan_ValidEmail_ReturnsCorrectData()
    {
        // Arrange
        var emailText = @"
            gidday mate, see attached
            <expense><cost_centre>DEV632</cost_centre><total>35,000</total><payment_method>personal card</payment_method></expense>
        ";

        // Act
    var result = _service.ScanEmailText(emailText);

        // Assert
        Assert.Equal("DEV632", result.CostCentre);
        Assert.Equal(35000m, result.Total);
        Assert.Equal("personal card", result.PaymentMethod);
        Assert.Equal(30434.78m, result.TotalExcludingTax); // 35000 / 1.15
        Assert.Equal(4565.22m, result.SalesTax); // 35000 - (35000 / 1.15)
    }

    [Fact]
    public void Scan_MissingTotal_ThrowsValidationException()
    {
        // Arrange
        var emailText = @"
            <expense><cost_centre>DEV632</cost_centre><payment_method>personal card</payment_method></expense>
        ";

        // Act & Assert
    var exception = Assert.Throws<ValidationException>(() => _service.ScanEmailText(emailText));
        Assert.Equal("Missing required <total> tag", exception.Message);
    }

    [Fact]
    public void Scan_MissingClosingTag_ThrowsValidationException()
    {
        // Arrange
        var emailText = @"
            <expense><cost_centre>DEV632<total>35,000</total><payment_method>personal card</payment_method></expense>
        ";

        // Act & Assert
    var exception = Assert.Throws<ValidationException>(() => _service.ScanEmailText(emailText));
        Assert.Equal("Missing closing tag for <cost_centre>", exception.Message);
    }

    [Fact]
    public void Scan_MissingCostCentre_DefaultsToUnknown()
    {
        // Arrange
        var emailText = @"
            <expense><total>35,000</total><payment_method>personal card</payment_method></expense>
        ";

        // Act
    var result = _service.ScanEmailText(emailText);

        // Assert
        Assert.Equal("UNKNOWN", result.CostCentre);
    }
}