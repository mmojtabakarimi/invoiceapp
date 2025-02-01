import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "./email.service";
import { DailySalesReport } from "./types/daily-sales-report.type";

describe("EmailService", () => {
  let service: EmailService;
  let consoleSpy: jest.SpyInstance;

  const mockReport: DailySalesReport = {
    date: "2024-01-30",
    totalSales: 1000.5,
    itemsSummary: [
      { sku: "ITEM-123", totalQuantity: 5 },
      { sku: "ITEM-456", totalQuantity: 3 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sendDailySalesReport", () => {
    it("should format and log email content correctly", async () => {
      await service.sendDailySalesReport(mockReport);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Sending email with daily sales report...",
      );
      expect(consoleSpy).toHaveBeenCalledWith("To: admin@company.com");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Subject: Daily Sales Report - 2024-01-30",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Total Sales: $1000.50"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("- ITEM-123: 5 units"),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("- ITEM-456: 3 units"),
      );
    });
  });
});
