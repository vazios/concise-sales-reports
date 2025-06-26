
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface MonthlyData {
  mes: string;
  total: number;
  transacoes: number;
  ticketMedio: number;
}

interface MonthlyDataWithGrowth extends MonthlyData {
  crescimento: number;
}

interface SalesData {
  valor: number;
  data: string;
}

interface MonthlyComparisonProps {
  data: SalesData[];
}

const MonthlyComparison = ({ data }: MonthlyComparisonProps) => {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Processar dados para comparação mensal
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyData: Record<string, MonthlyData> = {};
    
    data.forEach(item => {
      if (item.data && typeof item.data === 'string') {
        const [day, month, year] = item.data.split('/');
        if (day && month && year) {
          const monthKey = `${month}/${year}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              mes: monthKey,
              total: 0,
              transacoes: 0,
              ticketMedio: 0
            };
          }
          
          monthlyData[monthKey].total += item.valor;
          monthlyData[monthKey].transacoes += 1;
        }
      }
    });

    // Calcular ticket médio e ordenar por data
    return Object.values(monthlyData)
      .map(month => ({
        ...month,
        ticketMedio: month.transacoes > 0 ? month.total / month.transacoes : 0
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.mes.split('/');
        const [monthB, yearB] = b.mes.split('/');
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1);
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const monthlyData = getMonthlyData();

  // Calcular crescimento mensal
  const dataWithGrowth: MonthlyDataWithGrowth[] = monthlyData.map((month, index) => {
    let crescimento = 0;
    if (index > 0) {
      const anterior = monthlyData[index - 1].total;
      if (anterior > 0) {
        crescimento = ((month.total - anterior) / anterior) * 100;
      }
    }
    return {
      ...month,
      crescimento: crescimento
    };
  });

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Comparativo Mensal
        </CardTitle>
        <p className="text-sm text-slate-600">Evolução das vendas por mês</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de vendas mensais */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Vendas Totais por Mês</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataWithGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Total']}
                  labelStyle={{ color: '#334155' }}
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="total" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Estatísticas resumidas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 uppercase tracking-wide">Melhor Mês</p>
              {dataWithGrowth.length > 0 && (
                <>
                  <p className="font-semibold text-blue-800">
                    {dataWithGrowth.reduce((max, current) => 
                      current.total > max.total ? current : max
                    ).mes}
                  </p>
                  <p className="text-sm text-blue-700">
                    {formatCurrency(Math.max(...dataWithGrowth.map(m => m.total)))}
                  </p>
                </>
              )}
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600 uppercase tracking-wide">Crescimento Médio</p>
              {dataWithGrowth.length > 1 && (
                <p className="font-semibold text-green-800">
                  {(dataWithGrowth
                    .slice(1)
                    .reduce((sum, month) => sum + month.crescimento, 0) / 
                    (dataWithGrowth.length - 1)
                  ).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyComparison;
