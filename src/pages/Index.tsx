
import { useState, useEffect } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';
import GoalCard from '@/components/GoalCard';
import AddGoalDialog from '@/components/AddGoalDialog';
import ExpenseDialog from '@/components/ExpenseDialog';
import TransactionList from '@/components/TransactionList';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  // Local storage for goals and transactions
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);

  // Dialog states
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>();

  // Check if on mobile
  const isMobile = useIsMobile();

  // Handle adding a new goal
  const handleAddGoal = (newGoal: Goal) => {
    setGoals(prevGoals => [...prevGoals, newGoal]);
  };

  // Handle adding a new expense
  const handleAddExpense = (newTransaction: Transaction) => {
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);

    // Update goal's current amount
    setGoals(prevGoals => prevGoals.map(goal => goal.id === newTransaction.goalId ? {
      ...goal,
      currentAmount: goal.currentAmount + newTransaction.amount
    } : goal));
  };

  // Open expense dialog for a specific goal
  const handleOpenExpense = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsExpenseOpen(true);
  };
  
  // Toggle goal visibility
  const handleToggleHideGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.map(goal => 
      goal.id === goalId ? { ...goal, hidden: !goal.hidden } : goal
    ));
  };
  
  // Filter visible goals
  const visibleGoals = goals.filter(goal => !goal.hidden);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onAddGoal={() => setIsAddGoalOpen(true)} 
        goals={goals}
        transactions={transactions}
        onAddExpense={handleOpenExpense}
        onToggleHideGoal={handleToggleHideGoal}
      />
      
      <main className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* Mobile: Transaction History appears first */}
          {isMobile && <div className="mb-0">
              <ScrollArea className="h-[350px] pr-4 mx-0 my-0 py-0 px-[3px]">
                <TransactionList transactions={transactions} goals={goals} />
              </ScrollArea>
            </div>}
          
          {/* Goals Grid */}
          <div className="space-y-0 mx-0 px-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onAddExpense={handleOpenExpense} 
                  transactions={transactions}
                  onToggleHideGoal={handleToggleHideGoal}
                />
              ))}
            </div>
            
            {visibleGoals.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center mx-0 px-0">
                <h2 className="text-lg font-medium">У вас пока нет целей</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Создайте свою первую финансовую цель или проверьте скрытые цели
                </p>
              </div>
            )}
          </div>
          
          {/* Desktop: Transaction History */}
          {!isMobile && <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <TransactionList transactions={transactions} goals={goals} />
            </ScrollArea>}
        </div>
      </main>
      
      {/* Dialogs */}
      <AddGoalDialog isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} onAddGoal={handleAddGoal} />
      
      <ExpenseDialog isOpen={isExpenseOpen} onClose={() => {
      setIsExpenseOpen(false);
      setSelectedGoalId(undefined);
    }} onAddExpense={handleAddExpense} goals={goals} selectedGoalId={selectedGoalId} />
    </div>
  );
};

export default Index;
