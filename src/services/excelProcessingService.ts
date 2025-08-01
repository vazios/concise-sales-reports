import { SalesData } from '@/types/sales';

class ExcelProcessingService {
  processExcelData(jsonData: any[]): SalesData[] {
    console.log("Dados brutos do Excel:", jsonData);
    
    const headerRowIndex = this.findHeaderRow(jsonData);
    console.log("Índice do cabeçalho encontrado:", headerRowIndex);

    const dataRows = this.extractDataRows(jsonData, headerRowIndex);
    console.log("Linhas de dados filtradas:", dataRows);
    console.log("Número de linhas encontradas:", dataRows.length);

    const processedData = dataRows.map((row, index) => {
      const rowValues = Object.values(row);
      console.log(`Linha ${index + 1}:`, rowValues);
      
      const processedItem = this.processDataRow(rowValues, index);
      console.log(`Item final processado ${index + 1}:`, processedItem);
      return processedItem;
    }).filter(item => item.valor > 0);

    console.log("Dados processados finais:", processedData);
    console.log("Total de vendas válidas:", processedData.length);
    
    const totalCalculado = processedData.reduce((total, item) => total + Number(item.valor), 0);
    console.log("Total calculado imediatamente após processamento:", totalCalculado);
    
    return processedData;
  }

  private findHeaderRow(jsonData: any[]): number {
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const values = Object.values(row);
      const rowText = values.join(' ').toUpperCase();
      if (rowText.includes('CÓDIGO') || rowText.includes('CLIENTE') || rowText.includes('VALOR')) {
        return i;
      }
    }
    return 0; // Se não encontrou cabeçalho, assumir primeira linha
  }

  private extractDataRows(jsonData: any[], headerRowIndex: number) {
    return jsonData.slice(headerRowIndex + 1).filter((row, index) => {
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
  }

  private processDataRow(rowValues: any[], index: number): SalesData {
    const codigo = String(rowValues[0] || `V${String(index + 1).padStart(3, '0')}`);
    const cliente = String(rowValues[1] || 'Cliente não informado');
    
    // Valor recebido (coluna G - índice 6)
    const valorRecebido = this.processNumericValue(rowValues[6]);
    console.log(`Valor final processado para linha ${index + 1}:`, valorRecebido);
    
    // Forma de pagamento (coluna H - índice 7)
    const formaPagamento = this.extractPaymentMethod(rowValues[7]);
    
    // Canal (coluna I - índice 8)
    const canal = this.extractChannel(rowValues[8]);
    
    // Data (coluna J - índice 9)
    const dataFormatada = this.extractDate(rowValues[9]);

    return {
      id: index + 1,
      codigo,
      cliente,
      valor: valorRecebido,
      data: dataFormatada,
      formaPagamento,
      canal
    };
  }

  private extractPaymentMethod(paymentData: any): string {
    if (!paymentData || typeof paymentData !== 'string') {
      return 'Não informado';
    }

    const texto = paymentData.toUpperCase().trim();
    console.log("Analisando forma de pagamento:", texto);
    
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

    for (const forma of formasPagamento) {
      if (texto.includes(forma.chave)) {
        console.log(`Forma de pagamento encontrada: ${forma.chave} -> ${forma.valor}`);
        return forma.valor;
      }
    }

    console.log("Nenhuma forma conhecida encontrada, retornando texto original");
    return paymentData.trim();
  }

  private extractChannel(channelData: any): string {
    if (channelData === undefined || channelData === null) {
      return 'Não informado';
    }
    return String(channelData || 'Não informado').trim();
  }

  private extractDate(dateData: any): string {
    if (dateData === undefined || dateData === null) {
      return new Date().toLocaleDateString('pt-BR');
    }

    if (typeof dateData === 'number' && dateData > 40000 && dateData < 50000) {
      // Converter número serial do Excel para data
      const excelDate = new Date((dateData - 25569) * 86400 * 1000);
      return excelDate.toLocaleDateString('pt-BR');
    } else if (typeof dateData === 'string' && dateData.includes('/')) {
      return dateData;
    } else if (typeof dateData === 'string' && dateData.trim() !== '') {
      return dateData;
    }

    return new Date().toLocaleDateString('pt-BR');
  }

  private processNumericValue(valor: any): number {
    console.log("Processando valor:", valor, "Tipo:", typeof valor);
    
    if (valor === undefined || valor === null || valor === '') {
      return 0;
    }

    // Se já é um número válido, usar diretamente
    if (typeof valor === 'number' && !isNaN(valor)) {
      const valorFinal = Number(valor);
      console.log("Valor numérico processado:", valorFinal);
      return valorFinal;
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

      const numeroConvertido = Number(valorLimpo);
      console.log("Número convertido:", numeroConvertido);
      
      if (isNaN(numeroConvertido)) {
        return 0;
      }

      return numeroConvertido;
    }

    return 0;
  }
}

export const excelProcessingService = new ExcelProcessingService();