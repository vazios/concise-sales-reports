import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, BarChart3, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SalesChart from "@/components/SalesChart";
import TrendChart from "@/components/TrendChart";
import SalesDetailModal from "@/components/SalesDetailModal";
import * as XLSX from 'xlsx';
import PieChartComponent from "@/components/PieChart";
import SeasonalityChart from "@/components/SeasonalityChart";
import CustomerRanking from "@/components/CustomerRanking";
import MonthlyComparison from "@/components/MonthlyComparison";
import DragDropUpload from "@/components/DragDropUpload";
import AdvancedFilters from "@/components/AdvancedFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import ExportReports from "@/components/ExportReports";

const Index = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState([]);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const processExcelData = (jsonData) => {
    console.log("Dados brutos do Excel:", jsonData);
    
    // Encontrar o índice do cabeçalho
    let headerRowIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const values = Object.values(row);
      // Procurar por uma linha que contenha palavras-chave do cabeçalho
      const rowText = values.join(' ').toUpperCase();
      if (rowText.includes('CÓDIGO') || rowText.includes('CLIENTE') || rowText.includes('VALOR')) {
        headerRowIndex = i;
        break;
      }
    }

    console.log("Índice do cabeçalho encontrado:", headerRowIndex);

    // Se não encontrou cabeçalho, assumir primeira linha
    if (headerRowIndex === -1) {
      headerRowIndex = 0;
    }

    // Pegar todas as linhas de dados (exceto cabeçalho e total)
    const dataRows = jsonData.slice(headerRowIndex + 1).filter((row, index) => {
      const rowValues = Object.values(row);
      const firstColumn = rowValues[0];
      
      // Verificar se não é linha de total
      const rowText = rowValues.join(' ').toUpperCase();
      if (rowText.includes('TOTAL')) {
        return false;
      }
      
      // Se a primeira coluna é um número válido, é uma linha de dados
      return firstColumn && 
             (typeof firstColumn === 'number' || 
              (typeof firstColumn === 'string' && !isNaN(Number(firstColumn))));
    });

    console.log("Linhas de dados filtradas:", dataRows);
    console.log("Número de linhas encontradas:", dataRows.length);

    // Função para extrair a forma de pagamento
    const extrairFormaPagamento = (textoCompleto) => {
      if (!textoCompleto || typeof textoCompleto !== 'string') {
        return 'Não informado';
      }

      const texto = textoCompleto.toUpperCase().trim();
      console.log("Analisando forma de pagamento:", texto);
      
      // Mapear formas de pagamento específicas - procurar pelos termos mais específicos primeiro
      const formasPagamento = [
        { chave: 'MASTERCARD_MAESTRO', valor: 'Mastercard Maestro' },
        { chave: 'VISA_ELECTRON', valor: 'Visa Electron' },
        { chave: 'VISA', valor: 'Visa' },
        { chave: 'ELO', valor: 'Elo' },
        { chave: 'MASTERCARD', valor: 'Mastercard' },
        { chave: 'PIX', valor: 'PIX' },
        { chave: 'CARTEIRA', valor: 'Carteira Digital' },
        { chave: 'CRÉDITO', valor: 'Crédito' },
        { chave: 'DÉBITO', valor: 'Débito' },
        { chave: 'DINHEIRO', valor: 'Dinheiro' },
        { chave: 'PICPAY', valor: 'PicPay' }
      ];

      // Procurar por cada forma de pagamento no texto
      for (const forma of formasPagamento) {
        if (texto.includes(forma.chave)) {
          console.log(`Forma de pagamento encontrada: ${forma.chave} -> ${forma.valor}`);
          return forma.valor;
        }
      }

      console.log("Nenhuma forma conhecida encontrada, retornando texto original");
      return textoCompleto.trim();
    };

    // Função melhorada para processar valores numéricos com foco em .xls vs .xlsx
    const processarValorNumerico = (valor) => {
      console.log("Processando valor:", valor, "Tipo:", typeof valor);
      
      if (valor === undefined || valor === null || valor === '') {
        return 0;
      }

      // Se já é um número válido
      if (typeof valor === 'number' && !isNaN(valor)) {
        // Verificar se o número parece estar em centavos (muito comum em .xls)
        // Se o valor for muito alto (acima de 100000), pode estar em centavos
        if (valor > 100000) {
          console.log("Valor possivelmente em centavos:", valor, "Convertendo para reais:", valor / 100);
          return valor / 100;
        }
        return valor;
      }

      // Se é string, tentar converter
      if (typeof valor === 'string') {
        // Remover espaços e caracteres não numéricos exceto vírgula, ponto e sinal negativo
        let valorLimpo = valor.toString().trim().replace(/[^\d,.-]/g, '');
        
        console.log("Valor original:", valor, "Valor limpo:", valorLimpo);
        
        // Se está vazio após limpeza, retornar 0
        if (!valorLimpo) {
          return 0;
        }

        // Tratar diferentes formatos de número
        // Formato brasileiro: 1.234,56 ou 1234,56
        if (valorLimpo.includes(',') && valorLimpo.lastIndexOf(',') > valorLimpo.lastIndexOf('.')) {
          // Remover pontos (separadores de milhares) e trocar vírgula por ponto
          valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
        }
        // Formato americano: 1,234.56 ou 1234.56
        else if (valorLimpo.includes(',')) {
          // Remover vírgulas (separadores de milhares)
          valorLimpo = valorLimpo.replace(/,/g, '');
        }

        const numeroConvertido = parseFloat(valorLimpo);
        console.log("Número convertido:", numeroConvertido);
        
        if (isNaN(numeroConvertido)) {
          return 0;
        }

        // Verificar se o número parece estar em centavos
        if (numeroConvertido > 100000) {
          console.log("String convertida possivelmente em centavos:", numeroConvertido, "Convertendo para reais:", numeroConvertido / 100);
          return numeroConvertido / 100;
        }

        return numeroConvertido;
      }

      return 0;
    };

    // Processar cada linha de dados usando o mapeamento das colunas
    const processedData = dataRows.map((row, index) => {
      const rowValues = Object.values(row);
      console.log(`Linha ${index + 1}:`, rowValues);
      
      // Mapear colunas conforme especificado:
      // A = código (índice 0), B = cliente (índice 1), G = valor recebido (índice 6), 
      // H = forma de pagamento (índice 7), I = canal (índice 8), J = data (índice 9)
      
      const codigo = String(rowValues[0] || `V${String(index + 1).padStart(3, '0')}`);
      const cliente = String(rowValues[1] || 'Cliente não informado');
      
      // Valor recebido (coluna G - índice 6) - usando função melhorada
      const valorRecebido = processarValorNumerico(rowValues[6]);
      console.log(`Valor processado para linha ${index + 1}:`, valorRecebido);
      
      // Forma de pagamento (coluna H - índice 7)
      let formaPagamento = 'Não informado';
      if (rowValues[7] !== undefined && rowValues[7] !== null) {
        const formaPagamentoTexto = String(rowValues[7] || '');
        formaPagamento = extrairFormaPagamento(formaPagamentoTexto);
      }
      
      // Canal (coluna I - índice 8)
      let canal = 'Não informado';
      if (rowValues[8] !== undefined && rowValues[8] !== null) {
        canal = String(rowValues[8] || 'Não informado').trim();
      }
      
      // Data (coluna J - índice 9)
      let dataFormatada = new Date().toLocaleDateString('pt-BR');
      if (rowValues[9] !== undefined && rowValues[9] !== null) {
        const dataValue = rowValues[9];
        if (typeof dataValue === 'number' && dataValue > 40000 && dataValue < 50000) {
          // Converter número serial do Excel para data
          const excelDate = new Date((dataValue - 25569) * 86400 * 1000);
          dataFormatada = excelDate.toLocaleDateString('pt-BR');
        } else if (typeof dataValue === 'string' && dataValue.includes('/')) {
          dataFormatada = dataValue;
        } else if (typeof dataValue === 'string' && dataValue.trim() !== '') {
          dataFormatada = dataValue;
        }
      }

      const processedItem = {
        id: index + 1,
        codigo: codigo,
        cliente: cliente,
        valor: valorRecebido,
        data: dataFormatada,
        formaPagamento: formaPagamento,
        canal: canal
      };
      
      console.log(`Item processado ${index + 1}:`, processedItem);
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
    
    if (selectedChannel !== "all") {
      filtered = filtered.filter(item => item.canal === selectedChannel);
    }
    
    // Melhorar filtro de data para suportar diferentes períodos
    if (selectedDate === "custom" && dateRange.start && dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data.split('/').reverse().join('-'));
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (selectedDate !== "all" && selectedDate !== "custom") {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      switch (selectedDate) {
        case "today":
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.data.split('/').reverse().join('-'));
            return itemDate.toDateString() === today.toDateString();
          });
          break;
        case "yesterday":
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.data.split('/').reverse().join('-'));
            return itemDate.toDateString() === yesterday.toDateString();
          });
          break;
        case "last7days":
          const last7Days = new Date(today);
          last7Days.setDate(last7Days.getDate() - 7);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.data.split('/').reverse().join('-'));
            return itemDate >= last7Days && itemDate <= today;
          });
          break;
        case "last30days":
          const last30Days = new Date(today);
          last30Days.setDate(last30Days.getDate() - 30);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.data.split('/').reverse().join('-'));
            return itemDate >= last30Days && itemDate <= today;
          });
          break;
        case "thisMonth":
          const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.data.split('/').reverse().join('-'));
            return itemDate >= thisMonthStart && itemDate <= today;
          });
          break;
        case "lastMonth":
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.data.split('/').reverse().join('-'));
            return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
          });
          break;
        default:
          // Filtro por data específica (mantém comportamento anterior)
          filtered = filtered.filter(item => item.data === selectedDate);
      }
    }
    
    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setSelectedPaymentMethod("all");
    setSelectedChannel("all");
    setSelectedDate("all");
    setDateRange({ start: "", end: "" });
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
  const channels = [...new Set(data.map(item => item.canal))];
  const dates = [...new Set(data.map(item => item.data))].sort();

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

        {/* Dashboard */}
        {hasUploadedFile && data.length > 0 && (
          <>
            {/* Filtros */}
            <AdvancedFilters
              paymentMethods={paymentMethods}
              channels={channels}
              dates={dates}
              selectedPaymentMethod={selectedPaymentMethod}
              selectedChannel={selectedChannel}
              selectedDate={selectedDate}
              dateRange={dateRange}
              onPaymentMethodChange={setSelectedPaymentMethod}
              onChannelChange={setSelectedChannel}
              onDateChange={setSelectedDate}
              onDateRangeChange={setDateRange}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />

            {/* Exportação de Relatórios */}
            <ExportReports
              data={data}
              filteredData={filteredData}
              paymentMethodSummary={getPaymentMethodSummary()}
              totalSales={getTotalSales()}
              filters={{
                paymentMethod: selectedPaymentMethod,
                channel: selectedChannel,
                dateRange: dateRange
              }}
            />

            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total de Vendas</p>
                      <h3 className="text-2xl sm:text-3xl font-bold">
                        R$ {getTotalSales().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Número de Vendas</p>
                      <h3 className="text-2xl sm:text-3xl font-bold">{filteredData.length}</h3>
                    </div>
                    <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Ticket Médio</p>
                      <h3 className="text-2xl sm:text-3xl font-bold">
                        R$ {filteredData.length > 0 ? (getTotalSales() / filteredData.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                      </h3>
                    </div>
                    <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SalesChart 
                data={getPaymentMethodSummary()} 
                onBarClick={handleChartClick}
              />
              <PieChartComponent 
                data={getPaymentMethodSummary()}
              />
            </div>

            {/* Análises Avançadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TrendChart data={getDailySales()} />
              <SeasonalityChart data={filteredData} />
            </div>

            {/* Comparativo e Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <MonthlyComparison data={filteredData} />
              <CustomerRanking data={filteredData} />
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
