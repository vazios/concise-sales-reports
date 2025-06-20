
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface WeekdayData {
  day: string;
  total: number;
  average: number;
  count: number;
}

interface SalesData {
  valor: number;
  data: string;
}

interface SeasonalityChartProps {
  data: SalesData[];
}

const SeasonalityChart = ({ data }: SeasonalityChartProps) => {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Processar dados para análise por dia da semana
  const getWeekdayAnalysis = (): WeekdayData[] => {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const weekdayData: Record<string, { total: number; count: number }> = {};
    
    weekdays.forEach(day => {
      weekdayData[day] = { total: 0, count: 0 };
    });

    data.forEach(item => {
      if (item.data && typeof item.data === 'string') {
        const [day, month, year] = item.data.split('/');
        if (day && month && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const weekdayIndex = date.getDay();
          const weekdayName = weekdays[weekdayIndex];
          
          if (weekdayData[weekdayName]) {
            weekdayData[weekdayName].total += item.valor;
            weekdayData[weekdayName].count += 1;
          }
        }
      }
    });

    return Object.entries(weekdayData).map(([day, data]) => ({
      day,
      total: data.total,
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count
    }));
  };

  const weekdayData = getWeekdayAnalysis();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Análise de Sazonalidade
        </CardTitle>
        <p className="text-sm text-slate-600">Vendas por dia da semana</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekdayData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="day" 
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
              formatter={(value, name) => [
                formatCurrency(value as number), 
                name === 'total' ? 'Total' : 'Média por dia'
              ]}
              labelStyle={{ color: '#334155' }}
              contentStyle={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="total" 
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              className="hover:fill-purple-700 transition-colors duration-200"
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-slate-600">
          <p>Análise baseada em {data.length} transações</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonalityChart;
