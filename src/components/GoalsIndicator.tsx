
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const GoalsIndicator = ({ data, monthlyGoal = 10000, dailyGoal = 500 }) => {
  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Calcular métricas atuais
  const totalSales = data.reduce((sum, item) => sum + item.valor, 0);
  
  // Calcular vendas do mês atual
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const currentMonthSales = data.filter(item => {
    if (item.data && typeof item.data === 'string') {
      const [day, month, year] = item.data.split('/');
      return parseInt(month) === currentMonth && parseInt(year) === currentYear;
    }
    return false;
  }).reduce((sum, item) => sum + item.valor, 0);

  // Calcular vendas de hoje
  const today = new Date().toLocaleDateString('pt-BR');
  const todaySales = data.filter(item => item.data === today)
    .reduce((sum, item) => sum + item.valor, 0);

  // Calcular progressos
  const monthlyProgress = Math.min((currentMonthSales / monthlyGoal) * 100, 100);
  const dailyProgress = Math.min((todaySales / dailyGoal) * 100, 100);

  // Calcular tendências (comparação com período anterior)
  const getGrowthIcon = (current, goal) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage >= 75) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    if (percentage >= 50) return <Minus className="h-4 w-4 text-orange-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-yellow-500";
    if (progress >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const goals = [
    {
      title: "Meta Mensal",
      current: currentMonthSales,
      goal: monthlyGoal,
      progress: monthlyProgress,
      period: `${currentMonth.toString().padStart(2, '0')}/${currentYear}`
    },
    {
      title: "Meta Diária",
      current: todaySales,
      goal: dailyGoal,
      progress: dailyProgress,
      period: "Hoje"
    }
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-red-600" />
          Metas vs Realizado
        </CardTitle>
        <p className="text-sm text-slate-600">Acompanhamento de metas e indicadores</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">{goal.title}</h4>
                  <p className="text-xs text-slate-600">{goal.period}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getGrowthIcon(goal.current, goal.goal)}
                  <span className="text-sm font-medium">
                    {goal.progress.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <Progress 
                value={goal.progress} 
                className="h-2"
              />
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Atual: {formatCurrency(goal.current)}
                </span>
                <span className="text-slate-600">
                  Meta: {formatCurrency(goal.goal)}
                </span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  goal.progress >= 100 ? 'bg-green-100 text-green-700' :
                  goal.progress >= 75 ? 'bg-yellow-100 text-yellow-700' :
                  goal.progress >= 50 ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {goal.progress >= 100 ? 'Meta Atingida!' :
                   goal.progress >= 75 ? 'Próximo da Meta' :
                   goal.progress >= 50 ? 'No Caminho' :
                   'Abaixo do Esperado'}
                </span>
                <span className="text-slate-500">
                  Faltam: {formatCurrency(Math.max(0, goal.goal - goal.current))}
                </span>
              </div>
            </div>
          ))}
          
          {/* Resumo geral */}
          <div className="pt-4 border-t border-slate-200">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Total Geral</p>
              <p className="text-lg font-semibold text-slate-800">
                {formatCurrency(totalSales)}
              </p>
              <p className="text-xs text-slate-600">
                {data.length} transações processadas
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsIndicator;
