import { useMemo, useState } from 'react';
import { Transaction, Goal } from '@/interfaces';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArchiveIcon, ArrowDownCircle, ArrowUpCircle, Undo } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  goals: Goal[];
  onUndoTransaction: (transactionId: string) => void;
}

const TransactionList = ({ transactions, goals, onUndoTransaction }: TransactionListProps) => {
  const [activeTab, setActiveTab] = useState<string>("recent");
  const [swipedTransactionId, setSwipedTransactionId] = useState<string | null>(null);
  
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

  // Handle swipe
  const handleTouchStart = (transactionId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.currentTarget as any).startX = touch.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = (e.currentTarget as any).startX;
    const currentX = touch.clientX;
    const diff = startX - currentX;
    
    // If swiping left more than 50px, show undo button
    if (diff > 50) {
      const transactionId = e.currentTarget.getAttribute('data-transaction-id');
      if (transactionId) {
        setSwipedTransactionId(transactionId);
      }
    } else {
      setSwipedTransactionId(null);
    }
  };

  const handleTouchEnd = () => {
    // Keep the swiped state until user taps elsewhere
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-4 text-center">
          <div className="rounded-full bg-secondary/50 p-2">
            <ArchiveIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-2 text-base font-medium">Нет транзакций</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Добавьте свои первые транзакции, чтобы отслеживать прогресс
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
            const isIncome = transaction.amount < 0;
            const isSwipedItem = swipedTransactionId === transaction.id;
            
            return (
              <div
                key={transaction.id}
                className={cn(
                  "relative",
                  index !== dateTransactions.length - 1 && "border-b border-muted/30"
                )}
              >
                {/* Undo button that appears when swiped */}
                {isSwipedItem && (
                  <div 
                    className="absolute right-0 top-0 bottom-0 flex items-center bg-red-500 text-white px-4 z-10"
                    onClick={() => {
                      onUndoTransaction(transaction.id);
                      setSwipedTransactionId(null);
                    }}
                  >
                    <Undo className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Отменить</span>
                  </div>
                )}
                
                <div
                  data-transaction-id={transaction.id}
                  onTouchStart={(e) => handleTouchStart(transaction.id, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={cn(
                    "flex items-start justify-between gap-3 px-4 py-2 hover:bg-muted/30 relative transition-transform duration-200",
                    isSwipedItem && "transform -translate-x-20"
                  )}
                  onClick={() => {
                    // Clicking anywhere else resets the swiped state
                    if (swipedTransactionId) {
                      setSwipedTransactionId(null);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="rounded-full p-1.5"
                      style={{ 
                        backgroundColor: isIncome ? 'rgba(34, 197, 94, 0.15)' : (goal ? `${goal.color}15` : 'rgba(239, 68, 68, 0.15)'),
                        color: isIncome ? 'rgb(34, 197, 94)' : (goal?.color || 'rgb(239, 68, 68)')
                      }}
                    >
                      {isIncome ? (
                        <ArrowUpCircle className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownCircle className="h-3.5 w-3.5" />
                      )}
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
                  <div className="flex items-center gap-1">
                    <p className={`shrink-0 text-sm font-medium ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} ₽
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1 rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUndoTransaction(transaction.id);
                      }}
                      title="Отменить транзакцию"
                    >
                      <Undo className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
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
        <CardTitle className="text-lg">История транзакций</CardTitle>
        <CardDescription className="text-xs">
          Все транзакции по вашим финансовым целям
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Tabs defaultValue="recent" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-1 grid w-full grid-cols-2">
            <TabsTrigger value="recent">Последние</TabsTrigger>
            <TabsTrigger value="all">Все транзакции</TabsTrigger>
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
