import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, DollarSign, Calendar, CreditCard, User } from "lucide-react";
import * as XLSX from "xlsx";

const SalesDetailModal = ({ isOpen, onClose, data }) => {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState("data");
  const [sortDir, setSortDir] = React.useState("desc");

  const getTotalValue = React.useCallback(() => {
    return (data ?? []).reduce((total, item) => total + (Number(item.valor) || 0), 0);
  }, [data]);

  const formatCurrency = (value) => {
    return `R$ ${(Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const paymentMethod = data?.[0]?.formaPagamento;

  const normalize = (s) => (s ?? "").toString().toLowerCase();

  const filtered = React.useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return data ?? [];
    return (data ?? []).filter((sale) => {
      const codigo = normalize(sale.codigo);
      const cliente = normalize(sale.cliente);
      const valorNum = Number(sale.valor) || 0;
      const valorStr = valorNum.toFixed(2).replace('.', ',');
      const valorFmt = normalize(formatCurrency(valorNum));
      return (
        codigo.includes(q) ||
        cliente.includes(q) ||
        valorStr.includes(q) ||
        valorFmt.includes(q)
      );
    });
  }, [data, query]);

  const parseDate = (d) => {
    if (!d) return 0;
    if (typeof d === 'string' && d.includes('/')) {
      const [dd, mm, yyyy] = d.split('/').map(Number);
      if (yyyy && mm && dd) return new Date(yyyy, mm - 1, dd).getTime();
    }
    const t = new Date(d).getTime();
    return isNaN(t) ? 0 : t;
  };

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'codigo':
          return dir * String(a.codigo ?? '').localeCompare(String(b.codigo ?? ''), 'pt-BR', { numeric: true });
        case 'cliente':
          return dir * String(a.cliente ?? '').localeCompare(String(b.cliente ?? ''), 'pt-BR', { numeric: true });
        case 'canal':
          return dir * String(a.canal ?? '').localeCompare(String(b.canal ?? ''), 'pt-BR', { numeric: true });
        case 'valor':
          return dir * ((Number(a.valor) || 0) - (Number(b.valor) || 0));
        case 'data':
        default:
          return dir * (parseDate(a.data) - parseDate(b.data));
      }
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderSort = (key) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 inline ml-1 text-slate-500" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-4 w-4 inline ml-1 text-slate-500" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1 text-slate-500" />
    );
  };

  const handleExport = () => {
    const rows = (sorted ?? []).map((s) => ({
      "Código": s.codigo,
      "Cliente": s.cliente,
      "Canal": s.canal ?? '',
      "Valor": Number(s.valor) || 0,
      "Data": s.data,
      "Forma de Pagamento": s.formaPagamento ?? paymentMethod ?? ''
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    const safeName = (paymentMethod || 'geral').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
    XLSX.writeFile(wb, `vendas-${safeName}.xlsx`);
  };

  if (!data || data.length === 0) return null;

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

        {/* Ações: Busca + Exportação */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por valor, cliente ou código"
              className="pl-9"
            />
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar .xlsx
          </Button>
        </div>

        {/* Tabela de Detalhes */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead onClick={() => toggleSort('codigo')} className="font-semibold cursor-pointer select-none">
                  <span>Código</span>{renderSort('codigo')}
                </TableHead>
                <TableHead onClick={() => toggleSort('cliente')} className="font-semibold cursor-pointer select-none">
                  <span>Cliente</span>{renderSort('cliente')}
                </TableHead>
                <TableHead onClick={() => toggleSort('canal')} className="font-semibold cursor-pointer select-none">
                  <span>Canal</span>{renderSort('canal')}
                </TableHead>
                <TableHead onClick={() => toggleSort('valor')} className="font-semibold cursor-pointer select-none">
                  <span>Valor</span>{renderSort('valor')}
                </TableHead>
                <TableHead onClick={() => toggleSort('data')} className="font-semibold cursor-pointer select-none">
                  <span>Data</span>{renderSort('data')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((sale) => (
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
