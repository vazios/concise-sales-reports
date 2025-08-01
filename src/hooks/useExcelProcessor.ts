import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";
import { excelProcessingService } from '@/services/excelProcessingService';
import { SalesData } from '@/types/sales';

export const useExcelProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File): Promise<SalesData[]> => {
    setIsProcessing(true);
    
    try {
      if (!file.type.includes('sheet') && !file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        throw new Error('Formato de arquivo inválido');
      }

      const result = await new Promise<SalesData[]>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const result = e.target?.result;
            if (!result) {
              throw new Error("Falha ao ler o arquivo");
            }
            
            const data = new Uint8Array(result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
              throw new Error('Planilha vazia');
            }

            const processedData = excelProcessingService.processExcelData(jsonData);
            
            if (processedData.length === 0) {
              throw new Error('Nenhum dado válido encontrado');
            }

            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsArrayBuffer(file);
      });

      toast({
        title: "Arquivo carregado com sucesso!",
        description: `${file.name} foi processado. ${result.length} vendas encontradas.`,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro ao processar arquivo",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processFile,
    isProcessing
  };
};