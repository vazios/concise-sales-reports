
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Table } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportReportsProps {
  data: any[];
  filteredData: any[];
  paymentMethodSummary: { name: string; value: number }[];
  totalSales: number;
  filters: {
    paymentMethod: string;
    channel: string;
    dateRange: { start: string; end: string };
  };
}

const ExportReports: React.FC<ExportReportsProps> = ({
  data,
  filteredData,
  paymentMethodSummary,
  totalSales,
  filters
}) => {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Relatório de Vendas', 20, 20);
      
      // Período
      doc.setFontSize(12);
      let periodText = 'Período: ';
      if (filters.dateRange.start && filters.dateRange.end) {
        periodText += `${filters.dateRange.start} a ${filters.dateRange.end}`;
      } else {
        periodText += 'Todos os períodos';
      }
      doc.text(periodText, 20, 35);
      
      // Resumo Geral
      doc.setFontSize(14);
      doc.text('Resumo Geral', 20, 50);
      doc.setFontSize(10);
      doc.text(`Total de Vendas: ${formatCurrency(totalSales)}`, 20, 60);
      doc.text(`Número de Vendas: ${filteredData.length}`, 20, 70);
      doc.text(`Ticket Médio: ${formatCurrency(totalSales / filteredData.length || 0)}`, 20, 80);
      
      // Resumo por Forma de Pagamento
      doc.setFontSize(14);
      doc.text('Resumo por Forma de Pagamento', 20, 100);
      
      const paymentData = paymentMethodSummary.map(item => [
        item.name,
        formatCurrency(item.value),
        `${((item.value / totalSales) * 100).toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        startY: 110,
        head: [['Forma de Pagamento', 'Valor', 'Percentual']],
        body: paymentData,
        theme: 'grid',
        styles: { fontSize: 8 }
      });
      
      // Detalhes das Vendas
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Detalhes das Vendas', 20, 20);
      
      const salesData = filteredData.slice(0, 100).map(sale => [
        sale.codigo,
        sale.cliente,
        sale.canal || 'N/A',
        sale.formaPagamento,
        formatCurrency(sale.valor),
        sale.data
      ]);
      
      autoTable(doc, {
        startY: 30,
        head: [['Código', 'Cliente', 'Canal', 'Forma Pagto', 'Valor', 'Data']],
        body: salesData,
        theme: 'grid',
        styles: { fontSize: 7 }
      });
      
      if (filteredData.length > 100) {
        doc.text(`Mostrando 100 de ${filteredData.length} vendas`, 20, doc.lastAutoTable.finalY + 10);
      }
      
      doc.save('relatorio-vendas.pdf');
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O relatório foi baixado.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const generateExcelReport = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Aba de Resumo
      const summaryData = [
        ['Relatório de Vendas'],
        [''],
        ['Período:', filters.dateRange.start && filters.dateRange.end ? 
          `${filters.dateRange.start} a ${filters.dateRange.end}` : 'Todos os períodos'],
        [''],
        ['Resumo Geral'],
        ['Total de Vendas', formatCurrency(totalSales)],
        ['Número de Vendas', filteredData.length],
        ['Ticket Médio', formatCurrency(totalSales / filteredData.length || 0)],
        [''],
        ['Resumo por Forma de Pagamento'],
        ['Forma de Pagamento', 'Valor', 'Percentual'],
        ...paymentMethodSummary.map(item => [
          item.name,
          item.value,
          `${((item.value / totalSales) * 100).toFixed(1)}%`
        ])
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');
      
      // Aba de Detalhes
      const detailsData = [
        ['Código', 'Cliente', 'Canal', 'Forma de Pagamento', 'Valor', 'Data'],
        ...filteredData.map(sale => [
          sale.codigo,
          sale.cliente,
          sale.canal || 'N/A',
          sale.formaPagamento,
          sale.valor,
          sale.data
        ])
      ];
      
      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
      XLSX.utils.book_append_sheet(wb, detailsWs, 'Detalhes');
      
      XLSX.writeFile(wb, 'relatorio-vendas.xlsx');
      
      toast({
        title: "Excel gerado com sucesso!",
        description: "O relatório foi baixado.",
      });
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast({
        title: "Erro ao gerar Excel",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5 text-green-600" />
          Exportar Relatórios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={generatePDFReport}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          
          <Button 
            onClick={generateExcelReport}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Table className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          <p>• PDF: Relatório formatado com resumo e detalhes</p>
          <p>• Excel: Dados completos em planilha editável</p>
          {filteredData.length > 100 && (
            <p className="text-orange-600">• PDF limitado a 100 vendas (Excel completo)</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportReports;
