
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
const SalesChart = ({ data, onBarClick }) => {
  const handleBarClick = (data) => {
    if (data && data.activeLabel) {
      onBarClick(data.activeLabel);
    }
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };
  
  const sortedData = useMemo(
    () => ([...(data ?? [])]).sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0)),
    [data]
  );

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Vendas por Forma de Pagamento
        </CardTitle>
        <p className="text-sm text-slate-600">Clique em uma barra para ver os detalhes</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Total']}
              labelStyle={{ color: '#334155' }}
              contentStyle={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              className="hover:fill-blue-700 cursor-pointer transition-colors duration-200"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
