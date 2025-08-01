export interface SalesData {
  id: number;
  codigo: string;
  cliente: string;
  valor: number;
  data: string;
  formaPagamento: string;
  canal: string;
}

export interface FilterOptions {
  paymentMethod: string;
  channel: string;
  date: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DailySalesData {
  date: string;
  total: number;
}