import * as XLSX from 'xlsx';
import { SalesData } from '@/types/sales';

class ExportService {
  exportToExcel(data: SalesData[], filename: string = 'relatorio-vendas') {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'Código': item.codigo,
      'Cliente': item.cliente,
      'Valor': item.valor,
      'Data': item.data,
      'Forma de Pagamento': item.formaPagamento,
      'Canal': item.canal
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  exportSummaryToExcel(
    paymentSummary: { name: string; value: number }[],
    dailySales: { date: string; total: number }[],
    totalSales: number,
    filename: string = 'resumo-vendas'
  ) {
    // Planilha de resumo por forma de pagamento
    const paymentWs = XLSX.utils.json_to_sheet(paymentSummary.map(item => ({
      'Forma de Pagamento': item.name,
      'Valor Total': item.value
    })));

    // Planilha de vendas diárias
    const dailyWs = XLSX.utils.json_to_sheet(dailySales.map(item => ({
      'Data': item.date,
      'Total': item.total
    })));

    // Planilha de totais
    const summaryWs = XLSX.utils.json_to_sheet([{
      'Total Geral': totalSales,
      'Número de Vendas': dailySales.length,
      'Data Exportação': new Date().toLocaleDateString('pt-BR')
    }]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, paymentWs, 'Por Forma Pagamento');
    XLSX.utils.book_append_sheet(wb, dailyWs, 'Por Data');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo Geral');
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  downloadJSON(data: any, filename: string) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${filename}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

export const exportService = new ExportService();