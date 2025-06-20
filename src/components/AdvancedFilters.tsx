
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Filter, X, CalendarRange } from "lucide-react";

interface AdvancedFiltersProps {
  paymentMethods: string[];
  channels: string[];
  dates: string[];
  selectedPaymentMethod: string;
  selectedChannel: string;
  selectedDate: string;
  dateRange: { start: string; end: string };
  onPaymentMethodChange: (value: string) => void;
  onChannelChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  paymentMethods,
  channels,
  dates,
  selectedPaymentMethod,
  selectedChannel,
  selectedDate,
  dateRange,
  onPaymentMethodChange,
  onChannelChange,
  onDateChange,
  onDateRangeChange,
  onApplyFilters,
  onResetFilters
}) => {
  const hasActiveFilters = 
    selectedPaymentMethod !== "all" || 
    selectedChannel !== "all" || 
    selectedDate !== "all" ||
    (dateRange.start && dateRange.end);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-blue-600" />
          Filtros de Análise
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              Ativos
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primeira linha de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Forma de Pagamento
              </label>
              <Select value={selectedPaymentMethod} onValueChange={onPaymentMethodChange}>
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
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Canal
              </label>
              <Select value={selectedChannel} onValueChange={onChannelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um canal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os canais</SelectItem>
                  {channels.map(channel => (
                    <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Filtro de Data
              </label>
              <Select value={selectedDate} onValueChange={onDateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas</SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" />
                      Período personalizado
                    </div>
                  </SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                  <SelectItem value="lastMonth">Mês passado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtro de período personalizado */}
          {selectedDate === 'custom' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data Inicial
                  </label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data Final
                  </label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
              {dateRange.start && dateRange.end && (
                <div className="mt-3 p-2 bg-white dark:bg-slate-800 rounded border text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Período selecionado: {dateRange.start} até {dateRange.end}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              onClick={onApplyFilters} 
              className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
            <Button 
              onClick={onResetFilters} 
              variant="outline"
              className="flex-1 sm:flex-none"
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar {hasActiveFilters ? '(Ativos)' : ''}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
