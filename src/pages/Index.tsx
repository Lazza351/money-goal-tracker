
import { useState, useEffect } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';
import GoalCard from '@/components/GoalCard';
import SurvivalGoalCard from '@/components/SurvivalGoalCard';
import AddGoalDialog from '@/components/AddGoalDialog';
import SurvivalGoalDialog from '@/components/SurvivalGoalDialog';
import ExpenseDialog from '@/components/ExpenseDialog';
import TransactionList from '@/components/TransactionList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';
import { toast } from '@/components/ui/toast-utils';

const Index = () => {
  // Local storage for goals and transactions
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);

  // Dialog states
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isSurvivalGoalOpen, setIsSurvivalGoalOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>();

  // Check if on mobile
  const isMobile = useIsMobile();

  // Find survival goal
  const survivalGoal = goals.find(g => g.type === 'survival');

  // Handle adding a new goal
  const handleAddGoal = (newGoal: Goal) => {
    // If adding a survival goal and one already exists, update it
    if (newGoal.type === 'survival' && survivalGoal) {
      setGoals(prevGoals => prevGoals.map(g => 
        g.id === survivalGoal.id ? newGoal : g
      ));
    } else {
      setGoals(prevGoals => [...prevGoals, newGoal]);
    }
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

  // Handle adding income to survival goal
  const handleAddIncome = (goalId: string, amount: number) => {
    const updatedGoal = goals.find(g => g.id === goalId);
    if (!updatedGoal) return;
    
    // For survival goals, adding income means reducing the currentAmount (spent amount)
    setGoals(prevGoals => prevGoals.map(goal => goal.id === goalId ? {
      ...goal,
      currentAmount: Math.max(0, goal.currentAmount - amount)
    } : goal));
    
    // Record the transaction with negative amount (income)
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      goalId,
      amount: -amount, // negative amount represents income
      description: 'Пополнение бюджета',
      date: new Date(),
    };
    
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    toast.success('Бюджет пополнен');
  };

  // Open expense dialog for a specific goal
  const handleOpenExpense = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsExpenseOpen(true);
  };

  // Open edit survival goal dialog
  const handleEditSurvivalGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsSurvivalGoalOpen(true);
  };

  // Toggle goal visibility
  const handleToggleHideGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.map(goal => goal.id === goalId ? {
      ...goal,
      hidden: !goal.hidden
    } : goal));
  };

  // Create a survival goal
  const handleOpenSurvivalGoalDialog = () => {
    setIsSurvivalGoalOpen(true);
  };

  // Filter visible goals (exclude survival goal as it's displayed separately)
  const visibleStandardGoals = goals.filter(goal => !goal.hidden && goal.type !== 'survival');
  
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
          {isMobile && (
            <div>
              <ScrollArea className="h-[350px] pr-4 mx-0 my-0 py-0 px-[3px]">
                <TransactionList transactions={transactions} goals={goals} />
              </ScrollArea>
            </div>
          )}
          
          {/* Goals Section */}
          <div className="space-y-4 mx-0 px-0">
            {/* Add Survival Goal Button (only if no survival goal exists) */}
            {!survivalGoal && (
              <div className="mb-4">
                <Button 
                  onClick={handleOpenSurvivalGoalDialog}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Создать цель выживания
                </Button>
              </div>
            )}
            
            {/* Survival Goal Card */}
            {survivalGoal && (
              <SurvivalGoalCard 
                goal={survivalGoal} 
                onAddExpense={handleOpenExpense} 
                onAddIncome={handleAddIncome}
                onEditGoal={handleEditSurvivalGoal}
                transactions={transactions}
              />
            )}
            
            {/* Standard Goals Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleStandardGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onAddExpense={handleOpenExpense} 
                  transactions={transactions} 
                  onToggleHideGoal={handleToggleHideGoal} 
                />
              ))}
            </div>
            
            {visibleStandardGoals.length === 0 && !survivalGoal && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center mx-0 px-0 py-[41px]">
                <h2 className="text-lg font-medium">У вас пока нет целей</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Создайте свою первую финансовую цель или проверьте скрытые цели
                </p>
              </div>
            )}
          </div>
          
          {/* Desktop: Transaction History */}
          {!isMobile && (
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <TransactionList transactions={transactions} goals={goals} />
            </ScrollArea>
          )}
        </div>
      </main>
      
      {/* Dialogs */}
      <AddGoalDialog 
        isOpen={isAddGoalOpen} 
        onClose={() => setIsAddGoalOpen(false)} 
        onAddGoal={handleAddGoal} 
      />
      
      <SurvivalGoalDialog 
        isOpen={isSurvivalGoalOpen} 
        onClose={() => {
          setIsSurvivalGoalOpen(false);
          setSelectedGoalId(undefined);
        }} 
        onAddGoal={handleAddGoal}
        existingSurvivalGoal={selectedGoalId ? goals.find(g => g.id === selectedGoalId) : survivalGoal}
      />
      
      <ExpenseDialog 
        isOpen={isExpenseOpen} 
        onClose={() => {
          setIsExpenseOpen(false);
          setSelectedGoalId(undefined);
        }} 
        onAddExpense={handleAddExpense} 
        goals={goals} 
        selectedGoalId={selectedGoalId} 
      />
    </div>
  );
};

export default Index;
