using System.Text.RegularExpressions;
using System.Xml;
using EmailScanner.API.Models;

namespace EmailScanner.API.Services;

public class EmailScannerService
{
    private const decimal TAX_RATE = 0.15m; // 15% tax rate
    
    public EmailData ScanEmailText(string emailText)
    {
        var data = new EmailData();
        
        // Extract XML 
        var costCentre = ExtractTagContent(emailText, "cost_centre");
        var total = ExtractTagContent(emailText, "total");
        var paymentMethod = ExtractTagContent(emailText, "payment_method");
        var vendor = ExtractTagContent(emailText, "vendor");
        var description = ExtractTagContent(emailText, "description");
        var date = ExtractTagContent(emailText, "date");


        if (string.IsNullOrEmpty(total))
        {
            throw new ValidationException("Missing required <total> tag");
        }

        // calculate total and tax
        if (decimal.TryParse(total?.Replace(",", ""), out decimal totalAmount))
        {
            data.Total = totalAmount;
            data.SalesTax = Math.Round(totalAmount - (totalAmount / (1 + TAX_RATE)), 2);
            data.TotalExcludingTax = Math.Round(totalAmount - data.SalesTax, 2);
        }
        else
        {
            throw new ValidationException("Invalid total amount format");
        }

        // Set other fields
        data.CostCentre = string.IsNullOrEmpty(costCentre) ? "UNKNOWN" : costCentre;
        data.PaymentMethod = paymentMethod;
        data.Vendor = vendor;
        data.Description = description;
        data.Date = date;

        return data;
    }

    private string? ExtractTagContent(string text, string tagName)
    {
        var openingTag = $"<{tagName}>";
        var closingTag = $"</{tagName}>";

        var openingIndex = text.IndexOf(openingTag);
        if (openingIndex == -1)
        {
            return null;
        }

        var closingIndex = text.IndexOf(closingTag, openingIndex);
        if (closingIndex == -1)
        {
            throw new ValidationException($"Missing closing tag for <{tagName}>");
        }

        var startIndex = openingIndex + openingTag.Length;
        return text.Substring(startIndex, closingIndex - startIndex);
    }
}