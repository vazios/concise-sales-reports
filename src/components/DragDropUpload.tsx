
import React, { useCallback, useState } from 'react';
import { Upload, FileX, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DragDropUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasUploadedFile: boolean;
  dataLength: number;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileUpload,
  hasUploadedFile,
  dataLength
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('sheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        // Simular evento de input para compatibilidade
        const fakeEvent = {
          target: { files: [file] }
        } as React.ChangeEvent<HTMLInputElement>;
        onFileUpload(fakeEvent);
      }
    }
  }, [onFileUpload]);

  if (hasUploadedFile && dataLength > 0) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Planilha carregada: {dataLength} vendas encontradas
              </span>
            </div>
            <div>
              <Input
                type="file"
                accept=".xls,.xlsx"
                onChange={onFileUpload}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-all duration-300 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
          : 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-8 text-center">
        <div className={`mx-auto h-12 w-12 mb-4 transition-colors ${
          isDragOver ? 'text-blue-600' : 'text-blue-500'
        }`}>
          {isDragOver ? <FileX /> : <Upload />}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {isDragOver ? 'Solte o arquivo aqui' : 'Carregar Planilha de Vendas'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {isDragOver 
            ? 'Solte o arquivo Excel para fazer upload'
            : 'Arraste e solte um arquivo Excel (.xls ou .xlsx) ou clique para selecionar'
          }
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
          A planilha deve conter as colunas: A=Código, B=Cliente, G=Valor Recebido, H=Forma de Pagamento, I=Canal, J=Data
        </p>
        <Input
          type="file"
          accept=".xls,.xlsx"
          onChange={onFileUpload}
          className="max-w-md mx-auto"
        />
      </CardContent>
    </Card>
  );
};

export default DragDropUpload;
