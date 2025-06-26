
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, CreditCard, User } from "lucide-react";

const SalesDetailModal = ({ isOpen, onClose, data }) => {
  const getTotalValue = () => {
    return data.reduce((total, item) => total + item.valor, 0);
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (!data || data.length === 0) return null;

  const paymentMethod = data[0]?.formaPagamento;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Detalhes das Vendas - {paymentMethod}
          </DialogTitle>
        </DialogHeader>
        
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(getTotalValue())}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Vendas</p>
              <p className="text-lg font-bold text-slate-800">{data.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Ticket Médio</p>
              <p className="text-lg font-bold text-slate-800">
                {formatCurrency(getTotalValue() / data.length)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CreditCard className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Forma</p>
              <p className="text-lg font-bold text-slate-800">{paymentMethod}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Detalhes */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Canal</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium">{sale.codigo}</TableCell>
                  <TableCell>{sale.cliente}</TableCell>
                  <TableCell>{sale.canal || 'Não informado'}</TableCell>
                  <TableCell className="font-semibold text-green-700">
                    {formatCurrency(sale.valor)}
                  </TableCell>
                  <TableCell>{sale.data}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesDetailModal;
