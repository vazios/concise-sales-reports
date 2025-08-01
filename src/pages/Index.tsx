import { useState, useMemo } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import DragDropUpload from "@/components/DragDropUpload";
import AdvancedFilters from "@/components/AdvancedFilters";
import SalesChart from "@/components/SalesChart";
import TrendChart from "@/components/TrendChart";
import SalesDetailModal from "@/components/SalesDetailModal";
import PieChartComponent from "@/components/PieChart";
import SeasonalityChart from "@/components/SeasonalityChart";
import CustomerRanking from "@/components/CustomerRanking";
import MonthlyComparison from "@/components/MonthlyComparison";
import SalesMetrics from "@/components/SalesMetrics";
import ExportControls from "@/components/ExportControls";
import { LoadingSpinner, ChartSkeleton } from "@/components/ui/loading";
import { useExcelProcessor } from "@/hooks/useExcelProcessor";
import { useSalesData } from "@/hooks/useSalesData";
import { SalesData } from "@/types/sales";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<SalesData[]>([]);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const { processFile, isProcessing } = useExcelProcessor();
  const {
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
  } = useSalesData();

  // Métricas calculadas
  const averageTicket = useMemo(() => {
    return filteredData.length > 0 ? totalSales / filteredData.length : 0;
  }, [totalSales, filteredData.length]);

  const uniqueClients = useMemo(() => {
    const uniqueClientNames = new Set(filteredData.map(item => item.cliente));
    return uniqueClientNames.size;
  }, [filteredData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const processedData = await processFile(file);
      setData(processedData);
      setHasUploadedFile(true);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
    }
  };

  const handleChartClick = (paymentMethod: string) => {
    const details = filteredData.filter(item => item.formaPagamento === paymentMethod);
    setSelectedPaymentDetails(details);
    setIsModalOpen(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">
              Dashboard de Vendas
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sistema de Análise e Conferência de Vendas
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Upload Section */}
        <DragDropUpload 
          onFileUpload={handleFileUpload}
          hasUploadedFile={hasUploadedFile}
          dataLength={data.length}
        />

        {/* Loading State */}
        {isProcessing && (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-muted-foreground">Processando arquivo...</span>
          </div>
        )}

        {/* Dashboard */}
        {hasUploadedFile && data.length > 0 && (
          <>
            {/* Filtros */}
            <AdvancedFilters
              paymentMethods={paymentMethods}
              channels={channels}
              dates={dates}
              selectedPaymentMethod={filters.paymentMethod}
              selectedChannel={filters.channel}
              selectedDate={filters.date}
              dateRange={filters.dateRange}
              onPaymentMethodChange={(value) => updateFilters({ paymentMethod: value })}
              onChannelChange={(value) => updateFilters({ channel: value })}
              onDateChange={(value) => updateFilters({ date: value })}
              onDateRangeChange={(value) => updateFilters({ dateRange: value })}
              onApplyFilters={() => {}} // Filtros aplicados automaticamente via useMemo
              onResetFilters={resetFilters}
            />

            {/* Métricas de Vendas */}
            <SalesMetrics
              totalSales={totalSales}
              numberOfSales={filteredData.length}
              averageTicket={averageTicket}
              uniqueClients={uniqueClients}
            />

            {/* Controles de Exportação */}
            <ExportControls
              filteredData={filteredData}
              paymentSummary={paymentMethodSummary}
              dailySales={dailySales}
              totalSales={totalSales}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SalesChart 
                data={paymentMethodSummary} 
                onBarClick={handleChartClick}
              />
              <TrendChart data={dailySales} />
              <PieChartComponent data={paymentMethodSummary} />
              <SeasonalityChart data={filteredData} />
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <CustomerRanking data={filteredData} />
              <MonthlyComparison data={filteredData} />
            </div>

            {/* Modal de Detalhes */}
            <SalesDetailModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              data={selectedPaymentDetails}
            />
          </>
        )}

        {/* Estado quando arquivo foi carregado mas não há dados válidos */}
        {hasUploadedFile && data.length === 0 && (
          <Card className="border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/20">
            <CardContent className="p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Nenhum dado válido encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Verifique se a planilha contém as colunas necessárias e dados válidos
              </p>
              <Input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileUpload}
                className="max-w-md mx-auto"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
