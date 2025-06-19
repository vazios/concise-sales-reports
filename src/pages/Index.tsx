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
import * as XLSX from 'xlsx';

const Index = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState([]);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const processExcelData = (jsonData) => {
    console.log("Dados brutos do Excel:", jsonData);
    
    // Pegar todas as linhas exceto cabeçalho e total
    const dataRows = jsonData.filter((row, index) => {
      // Pular primeira linha (cabeçalho)
      if (index === 0) return false;
      
      // Verificar se a linha tem dados válidos (não é linha de total)
      const rowValues = Object.values(row);
      const firstColumn = rowValues[0];
      
      // Se a primeira coluna é um número válido, é uma linha de dados
      return firstColumn && 
             (typeof firstColumn === 'number' || 
              (typeof firstColumn === 'string' && !isNaN(Number(firstColumn))));
    });

    console.log("Linhas de dados filtradas:", dataRows);
    console.log("Número de linhas encontradas:", dataRows.length);

    // Função para extrair a forma de pagamento da string completa
    const extrairFormaPagamento = (textoCompleto) => {
      if (!textoCompleto || typeof textoCompleto !== 'string') {
        return 'Não informado';
      }

      const texto = textoCompleto.toUpperCase().trim();
      console.log("Analisando texto:", texto);
      
      // Se contém hífens, pegar a última parte (forma de pagamento real)
      if (texto.includes(' - ')) {
        const partes = texto.split(' - ');
        const ultimaParte = partes[partes.length - 1].trim();
        console.log("Última parte encontrada:", ultimaParte);
        
        // Mapear formas de pagamento conhecidas da última parte
        const mapeamentoFormas = {
          'PIX': 'PIX',
          'VISA': 'Visa',
          'MASTERCARD': 'Mastercard',
          'MASTERCARD_MAESTRO': 'Mastercard',
          'VISA_ELECTRON': 'Visa Electron',
          'ELO': 'Elo',
          'CARTEIRA': 'Carteira Digital',
          'DÉBITO': 'Débito',
          'CRÉDITO': 'Crédito'
        };
        
        // Verificar se a última parte corresponde a uma forma conhecida
        for (const [chave, valor] of Object.entries(mapeamentoFormas)) {
          if (ultimaParte.includes(chave)) {
            console.log(`Mapeamento encontrado: ${chave} -> ${valor}`);
            return valor;
          }
        }
        
        // Se não encontrou mapeamento, retornar a última parte limpa
        return ultimaParte;
      }
      
      // Para casos sem hífen (como "Delivery - Dinheiro" que vira "Dinheiro")
      const formasSimples = {
        'DINHEIRO': 'Dinheiro',
        'PIX': 'PIX',
        'DÉBITO': 'Débito',
        'CRÉDITO': 'Crédito',
        'VISA': 'Visa',
        'MASTERCARD': 'Mastercard',
        'ELO': 'Elo',
        'CARTEIRA': 'Carteira Digital'
      };
      
      // Procurar por formas de pagamento no texto completo
      for (const [chave, valor] of Object.entries(formasSimples)) {
        if (texto.includes(chave)) {
          console.log(`Forma simples encontrada: ${chave} -> ${valor}`);
          return valor;
        }
      }

      console.log("Nenhum mapeamento encontrado, retornando texto original");
      return textoCompleto.trim();
    };

    // Processar cada linha de dados
    const processedData = dataRows.map((row, index) => {
      const rowValues = Object.values(row);
      console.log(`Linha ${index + 1}:`, rowValues);
      
      // Mapear baseado na estrutura da planilha
      const codigo = rowValues[0] ? String(rowValues[0]) : `V${String(index + 1).padStart(3, '0')}`;
      const cliente = rowValues[1] ? String(rowValues[1]) : 'Cliente não informado';
      
      // Valor deve estar em uma das colunas intermediárias - vamos procurar por números que parecem valores
      let valorRecebido = 0;
      for (let i = 2; i < rowValues.length; i++) {
        const value = parseFloat(String(rowValues[i] || 0));
        // Procurar por valores que fazem sentido (entre 1 e 100000)
        if (!isNaN(value) && value > 0 && value < 100000) {
          valorRecebido = value;
          break;
        }
      }
      
      // Forma de pagamento - geralmente está nas últimas colunas como texto
      let formaPagamentoTexto = 'Não informado';
      for (let i = rowValues.length - 1; i >= 0; i--) {
        const value = String(rowValues[i] || '');
        // Procurar por texto que não seja número e não seja vazio
        if (value && 
            value !== 'undefined' && 
            value !== 'null' && 
            isNaN(Number(value)) && 
            value.length > 2) {
          formaPagamentoTexto = value;
          break;
        }
      }
      
      // Extrair apenas a forma de pagamento do texto completo
      const formaPagamento = extrairFormaPagamento(formaPagamentoTexto);
      
      // Para a data, procurar por números que podem ser datas do Excel
      let dataFormatada = new Date().toLocaleDateString('pt-BR');
      for (let i = 2; i < rowValues.length; i++) {
        const value = rowValues[i];
        if (typeof value === 'number' && value > 40000 && value < 50000) {
          // Converter número serial do Excel para data
          const excelDate = new Date((value - 25569) * 86400 * 1000);
          dataFormatada = excelDate.toLocaleDateString('pt-BR');
          break;
        }
      }

      const processedItem = {
        id: index + 1,
        codigo: codigo,
        cliente: cliente,
        valor: valorRecebido,
        data: dataFormatada,
        formaPagamento: formaPagamento
      };
      
      console.log(`Item processado ${index + 1}:`, processedItem);
      console.log(`Texto original: "${formaPagamentoTexto}" -> Forma extraída: "${formaPagamento}"`);
      return processedItem;
    }).filter(item => item.valor > 0); // Filtrar apenas vendas com valor

    console.log("Dados processados finais:", processedData);
    console.log("Total de vendas válidas:", processedData.length);
    return processedData;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.includes('sheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const result = e.target?.result;
            if (!result) {
              throw new Error("Falha ao ler o arquivo");
            }
            
            const data = new Uint8Array(result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Pegar a primeira planilha
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            
            // Converter para JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
              toast({
                title: "Planilha vazia",
                description: "A planilha não contém dados válidos.",
                variant: "destructive",
              });
              return;
            }

            // Processar os dados
            const processedData = processExcelData(jsonData);
            
            if (processedData.length === 0) {
              toast({
                title: "Nenhum dado válido encontrado",
                description: "Verifique se a planilha contém dados de vendas válidos.",
                variant: "destructive",
              });
              return;
            }

            setData(processedData);
            setFilteredData(processedData);
            setHasUploadedFile(true);
            
            toast({
              title: "Arquivo carregado com sucesso!",
              description: `${file.name} foi processado. ${processedData.length} vendas encontradas.`,
            });
            
          } catch (error) {
            console.error("Erro ao processar arquivo:", error);
            toast({
              title: "Erro ao processar arquivo",
              description: "Verifique se o arquivo Excel está no formato correto.",
              variant: "destructive",
            });
          }
        };
        
        reader.readAsArrayBuffer(file);
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
                Selecione um arquivo Excel (.xls ou .xlsx) com dados de vendas
              </p>
              <p className="text-sm text-slate-500 mb-4">
                A planilha deve conter as colunas: Código, Cliente, Valor Recebido, Data, Forma de Pagamento
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
        {hasUploadedFile && data.length > 0 && (
          <>
            {/* Arquivo carregado - opção de carregar novo */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Planilha carregada: {data.length} vendas encontradas
                    </span>
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={handleFileUpload}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        R$ {filteredData.length > 0 ? (getTotalSales() / filteredData.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
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

        {/* Estado quando arquivo foi carregado mas não há dados válidos */}
        {hasUploadedFile && data.length === 0 && (
          <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50/50">
            <CardContent className="p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Nenhum dado válido encontrado
              </h3>
              <p className="text-slate-600 mb-4">
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
