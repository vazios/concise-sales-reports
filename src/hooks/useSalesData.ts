import { useState, useCallback, useMemo } from 'react';
import { SalesData, FilterOptions } from '@/types/sales';

export const useSalesData = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    paymentMethod: "all",
    channel: "all",
    date: "all",
    dateRange: { start: "", end: "" }
  });

  const filteredData = useMemo(() => {
    let filtered = data;
    
    if (filters.paymentMethod !== "all") {
      filtered = filtered.filter(item => item.formaPagamento === filters.paymentMethod);
    }
    
    if (filters.channel !== "all") {
      filtered = filtered.filter(item => item.canal === filters.channel);
    }
    
    if (filters.date === "custom" && filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data.split('/').reverse().join('-'));
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (filters.date !== "all" && filters.date !== "custom") {
      filtered = filtered.filter(item => item.data === filters.date);
    }
    
    return filtered;
  }, [data, filters]);

  const paymentMethodSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    filteredData.forEach(item => {
      if (!summary[item.formaPagamento]) {
        summary[item.formaPagamento] = 0;
      }
      summary[item.formaPagamento] += Number(item.valor) || 0;
    });
    
    return Object.entries(summary).map(([name, value]) => ({ 
      name, 
      value: Number(value) 
    }));
  }, [filteredData]);

  const dailySales = useMemo(() => {
    const dailySales: Record<string, number> = {};
    filteredData.forEach(item => {
      if (!dailySales[item.data]) {
        dailySales[item.data] = 0;
      }
      dailySales[item.data] += Number(item.valor) || 0;
    });
    return Object.entries(dailySales).map(([date, total]) => ({ date, total }));
  }, [filteredData]);

  const totalSales = useMemo(() => {
    return filteredData.reduce((total, item) => {
      return total + (Number(item.valor) || 0);
    }, 0);
  }, [filteredData]);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      paymentMethod: "all",
      channel: "all", 
      date: "all",
      dateRange: { start: "", end: "" }
    });
  }, []);

  const paymentMethods = useMemo(() => 
    [...new Set(data.map(item => item.formaPagamento))], [data]
  );
  
  const channels = useMemo(() => 
    [...new Set(data.map(item => item.canal))], [data]
  );
  
  const dates = useMemo(() => 
    [...new Set(data.map(item => item.data))].sort(), [data]
  );

  return {
    data,
    setData,
    filteredData,
    filters,
    updateFilters,
    resetFilters,
    paymentMethodSummary,
    dailySales,
    totalSales,
    paymentMethods,
    channels,
    dates
  };
};