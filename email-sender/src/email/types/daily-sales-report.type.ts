export interface DailySalesReport {
  date: string;
  totalSales: number;
  itemsSummary: {
    sku: string;
    totalQuantity: number;
  }[];
}
