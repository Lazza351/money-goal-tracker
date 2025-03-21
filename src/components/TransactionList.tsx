import { useMemo, useState } from 'react';
import { Transaction, Goal } from '@/interfaces';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArchiveIcon, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  goals: Goal[];
}

const TransactionList = ({ transactions, goals }: TransactionListProps) => {
  const [activeTab, setActiveTab] = useState<string>("recent");
  
  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const grouped: Record<string, Transaction[]> = {};
    sorted.forEach((transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return grouped;
  }, [transactions]);
  
  // Get recent transactions (first 3)
  const recentTransactions = useMemo(() => {
    const allSorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return allSorted.slice(0, 3);
  }, [transactions]);
  
  // Group recent transactions by date for display
  const recentTransactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    recentTransactions.forEach((transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    return grouped;
  }, [recentTransactions]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-4 text-center">
          <div className="rounded-full bg-secondary/50 p-2">
            <ArchiveIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-2 text-base font-medium">Нет расходов</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Добавьте свои первые расходы, чтобы отслеживать прогресс
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render transactions grouped by date
  const renderTransactionsByDate = (groupedTransactions: Record<string, Transaction[]>) => {
    return Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
      <div key={date}>
        <div className="bg-muted/50 px-4 py-1">
          <p className="text-xs font-medium">
            {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: ru })}
          </p>
        </div>
        <div className="space-y-0">
          {dateTransactions.map((transaction, index) => {
            const goal = goals.find(g => g.id === transaction.goalId);
            return (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-start justify-between gap-3 px-4 py-2 hover:bg-muted/30",
                  index !== dateTransactions.length - 1 && "border-b border-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="rounded-full p-1.5"
                    style={{ 
                      backgroundColor: goal ? `${goal.color}15` : 'hsl(var(--muted))',
                      color: goal?.color
                    }}
                  >
                    <ArrowDownCircle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    {goal && (
                      <p className="text-xs text-muted-foreground">
                        {goal.title}
                      </p>
                    )}
                  </div>
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {transaction.amount.toLocaleString()} ₽
                </p>
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-lg">История расходов</CardTitle>
        <CardDescription className="text-xs">
          Все расходы по вашим финансовым целям
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Tabs defaultValue="recent" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-1 grid w-full grid-cols-2">
            <TabsTrigger value="recent">Последние</TabsTrigger>
            <TabsTrigger value="all">Все расходы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-0">
            {renderTransactionsByDate(recentTransactionsByDate)}
            
            {recentTransactions.length === 0 && (
              <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                Нет недавних транзакций
              </div>
            )}
            
            {recentTransactions.length > 0 && transactions.length > 3 && (
              <div 
                className="cursor-pointer px-4 py-2 text-center text-xs font-medium text-primary hover:underline"
                onClick={() => setActiveTab("all")}
              >
                Смотреть все транзакции
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-0">
            {renderTransactionsByDate(transactionsByDate)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
