namespace EmailScanner.API.Models;

public class EmailData
{
    public string? CostCentre { get; set; }
    public decimal Total { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Vendor { get; set; }
    public string? Description { get; set; }
    public string? Date { get; set; }
    public decimal TotalExcludingTax { get; set; }
    public decimal SalesTax { get; set; }
}