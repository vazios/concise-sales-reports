
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, User, TrendingUp } from "lucide-react";

interface CustomerData {
  nome: string;
  total: number;
  transacoes: number;
  ultimaCompra: string;
}

interface CustomerRanking extends CustomerData {
  ranking: number;
  ticketMedio: number;
}

interface SalesData {
  cliente: string;
  valor: number;
  data: string;
}

interface CustomerRankingProps {
  data: SalesData[];
}

const CustomerRanking = ({ data }: CustomerRankingProps) => {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Processar dados para ranking de clientes
  const getCustomerRanking = (): CustomerRanking[] => {
    const customerData: Record<string, CustomerData> = {};
    
    data.forEach(item => {
      if (item.cliente && item.cliente !== 'Não identificado') {
        if (!customerData[item.cliente]) {
          customerData[item.cliente] = {
            nome: item.cliente,
            total: 0,
            transacoes: 0,
            ultimaCompra: item.data
          };
        }
        customerData[item.cliente].total += item.valor;
        customerData[item.cliente].transacoes += 1;
        
        // Atualizar última compra (assumindo formato dd/mm/yyyy)
        const currentDate = new Date(item.data.split('/').reverse().join('-'));
        const lastDate = new Date(customerData[item.cliente].ultimaCompra.split('/').reverse().join('-'));
        if (currentDate > lastDate) {
          customerData[item.cliente].ultimaCompra = item.data;
        }
      }
    });

    return Object.values(customerData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((customer, index) => ({
        ...customer,
        ranking: index + 1,
        ticketMedio: customer.total / customer.transacoes
      }));
  };

  const topCustomers = getCustomerRanking();

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Crown className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Crown className="h-5 w-5 text-orange-600" />;
      default:
        return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          Ranking de Clientes
        </CardTitle>
        <p className="text-sm text-slate-600">Top 10 clientes por valor total</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCustomers.map((customer) => (
            <div 
              key={customer.nome} 
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getRankingIcon(customer.ranking)}
                <div>
                  <p className="font-medium text-slate-800">{customer.nome}</p>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span>{customer.transacoes} transações</span>
                    <span>Última: {customer.ultimaCompra}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {formatCurrency(customer.total)}
                </p>
                <p className="text-xs text-slate-600">
                  Ticket: {formatCurrency(customer.ticketMedio)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {topCustomers.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum cliente identificado encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerRanking;
