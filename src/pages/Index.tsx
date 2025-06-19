
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SalesChart from "@/components/SalesChart";
import TrendChart from "@/components/TrendChart";
import SalesDetailModal from "@/components/SalesDetailModal";

// Dados de exemplo simulando uma planilha processada
const sampleData = [
  { id: 1, codigo: "V001", cliente: "João Silva", valor: 1500, data: "2024-06-15", formaPagamento: "Cartão de Crédito" },
  { id: 2, codigo: "V002", cliente: "Maria Santos", valor: 800, data: "2024-06-15", formaPagamento: "PIX" },
  { id: 3, codigo: "V003", cliente: "Pedro Costa", valor: 2200, data: "2024-06-16", formaPagamento: "Cartão de Débito" },
  { id: 4, codigo: "V004", cliente: "Ana Oliveira", valor: 950, data: "2024-06-16", formaPagamento: "Dinheiro" },
  { id: 5, codigo: "V005", cliente: "Carlos Lima", valor: 1800, data: "2024-06-17", formaPagamento: "Cartão de Crédito" },
  { id: 6, codigo: "V006", cliente: "Lucia Ferreira", valor: 650, data: "2024-06-17", formaPagamento: "PIX" },
  { id: 7, codigo: "V007", cliente: "Roberto Silva", valor: 1200, data: "2024-06-18", formaPagamento: "Cartão de Crédito" },
  { id: 8, codigo: "V008", cliente: "Fernanda Costa", valor: 750, data: "2024-06-18", formaPagamento: "Dinheiro" },
  { id: 9, codigo: "V009", cliente: "Antonio Santos", valor: 1600, data: "2024-06-19", formaPagamento: "PIX" },
  { id: 10, codigo: "V010", cliente: "Beatriz Lima", valor: 900, data: "2024-06-19", formaPagamento: "Cartão de Débito" },
];

const Index = () => {
  const [data, setData] = useState(sampleData);
  const [filteredData, setFilteredData] = useState(sampleData);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState([]);
  const [hasUploadedFile, setHasUploadedFile] = useState(true); // Simula arquivo já carregado

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.includes('sheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setHasUploadedFile(true);
        toast({
          title: "Arquivo carregado com sucesso!",
          description: `${file.name} foi processado e os dados estão prontos para análise.`,
        });
      } else {
        toast({
          title: "Formato de arquivo inválido",
          description: "Por favor, selecione um arquivo Excel (.xls ou .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  const applyFilters = () => {
    let filtered = data;
    
    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter(item => item.formaPagamento === selectedPaymentMethod);
    }
    
    if (selectedDate !== "all") {
      filtered = filtered.filter(item => item.data === selectedDate);
    }
    
    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setSelectedPaymentMethod("all");
    setSelectedDate("all");
    setFilteredData(data);
  };

  const handleChartClick = (paymentMethod) => {
    const details = filteredData.filter(item => item.formaPagamento === paymentMethod);
    setSelectedPaymentDetails(details);
    setIsModalOpen(true);
  };

  const getPaymentMethodSummary = () => {
    const summary = {};
    filteredData.forEach(item => {
      if (!summary[item.formaPagamento]) {
        summary[item.formaPagamento] = 0;
      }
      summary[item.formaPagamento] += item.valor;
    });
    return Object.entries(summary).map(([name, value]) => ({ name, value }));
  };

  const getDailySales = () => {
    const dailySales = {};
    filteredData.forEach(item => {
      if (!dailySales[item.data]) {
        dailySales[item.data] = 0;
      }
      dailySales[item.data] += item.valor;
    });
    return Object.entries(dailySales).map(([date, total]) => ({ date, total }));
  };

  const getTotalSales = () => {
    return filteredData.reduce((total, item) => total + item.valor, 0);
  };

  const paymentMethods = [...new Set(data.map(item => item.formaPagamento))];
  const dates = [...new Set(data.map(item => item.data))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800">Dashboard de Vendas</h1>
          <p className="text-slate-600">Sistema de Análise e Conferência de Vendas</p>
        </div>

        {/* Upload Section */}
        {!hasUploadedFile && (
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
            <CardContent className="p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Carregar Planilha de Vendas
              </h3>
              <p className="text-slate-600 mb-4">
                Selecione um arquivo Excel (.xls ou .xlsx) para começar a análise
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

        {/* Dashboard */}
        {hasUploadedFile && (
          <>
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Filtros de Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-48">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Forma de Pagamento
                    </label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as formas</SelectItem>
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 min-w-48">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Data
                    </label>
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma data..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as datas</SelectItem>
                        {dates.map(date => (
                          <SelectItem key={date} value={date}>{date}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                      Aplicar Filtros
                    </Button>
                    <Button onClick={resetFilters} variant="outline">
                      Limpar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Geral */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total de Vendas</p>
                      <h3 className="text-3xl font-bold">
                        R$ {getTotalSales().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <DollarSign className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Número de Vendas</p>
                      <h3 className="text-3xl font-bold">{filteredData.length}</h3>
                    </div>
                    <TrendingUp className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Ticket Médio</p>
                      <h3 className="text-3xl font-bold">
                        R$ {(getTotalSales() / filteredData.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <BarChart3 className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid lg:grid-cols-2 gap-6">
              <SalesChart 
                data={getPaymentMethodSummary()} 
                onBarClick={handleChartClick}
              />
              <TrendChart data={getDailySales()} />
            </div>

            {/* Modal de Detalhes */}
            <SalesDetailModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              data={selectedPaymentDetails}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
