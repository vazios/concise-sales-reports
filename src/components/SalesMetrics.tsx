import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, BarChart3, Users } from "lucide-react";

interface SalesMetricsProps {
  totalSales: number;
  numberOfSales: number;
  averageTicket: number;
  uniqueClients: number;
}

const SalesMetrics: React.FC<SalesMetricsProps> = ({
  totalSales,
  numberOfSales,
  averageTicket,
  uniqueClients
}) => {
  const metrics = [
    {
      title: "Total de Vendas",
      value: `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: "status-info",
      change: "+12% vs mês anterior"
    },
    {
      title: "Número de Vendas",
      value: numberOfSales.toString(),
      icon: BarChart3,
      gradient: "status-success",
      change: "+8% vs mês anterior"
    },
    {
      title: "Ticket Médio",
      value: `R$ ${averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: "status-warning",
      change: "+5% vs mês anterior"
    },
    {
      title: "Clientes Únicos",
      value: uniqueClients.toString(),
      icon: Users,
      gradient: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
      change: "+15% vs mês anterior"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((metric, index) => (
        <Card 
          key={metric.title}
          className={`${metric.gradient} transition-all duration-300 hover:scale-105 animate-fade-in`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">
                  {metric.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {metric.value}
                </h3>
                <p className="text-white/70 text-xs mt-1">
                  {metric.change}
                </p>
              </div>
              <metric.icon className="h-8 w-8 sm:h-12 sm:w-12 text-white/80" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SalesMetrics;