import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { exportService } from '@/services/exportService';
import { SalesData } from '@/types/sales';
import { toast } from "@/hooks/use-toast";

interface ExportControlsProps {
  filteredData: SalesData[];
  paymentSummary: { name: string; value: number }[];
  dailySales: { date: string; total: number }[];
  totalSales: number;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  filteredData,
  paymentSummary,
  dailySales,
  totalSales
}) => {
  const handleExportDetailed = () => {
    try {
      exportService.exportToExcel(filteredData, 'vendas-detalhadas');
      toast({
        title: "Exportação realizada!",
        description: "Relatório detalhado exportado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar relatório detalhado.",
        variant: "destructive",
      });
    }
  };

  const handleExportSummary = () => {
    try {
      exportService.exportSummaryToExcel(
        paymentSummary,
        dailySales,
        totalSales,
        'resumo-vendas'
      );
      toast({
        title: "Exportação realizada!",
        description: "Resumo de vendas exportado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar resumo.",
        variant: "destructive",
      });
    }
  };

  const handleExportJSON = () => {
    try {
      exportService.downloadJSON({
        vendas: filteredData,
        resumo: {
          totalVendas: totalSales,
          numeroVendas: filteredData.length,
          porFormaPagamento: paymentSummary,
          porData: dailySales
        },
        dataExportacao: new Date().toISOString()
      }, 'dados-vendas');
      
      toast({
        title: "Exportação realizada!",
        description: "Dados JSON exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar dados JSON.",
        variant: "destructive",
      });
    }
  };

  if (filteredData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Exportar Relatórios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleExportDetailed}
            variant="outline"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Detalhado
          </Button>
          
          <Button 
            onClick={handleExportSummary}
            variant="outline"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Resumo
          </Button>
          
          <Button 
            onClick={handleExportJSON}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportControls;