export interface DailySalesReport {
  date: string;
  totalSales: number;
  itemsSold: {
    sku: string;
    totalQuantity: number;
    totalAmount: number;
  }[];
}
