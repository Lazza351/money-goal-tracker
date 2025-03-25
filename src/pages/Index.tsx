import { useState, useEffect } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { useLocalStorage, clearAllLocalStorage } from '@/hooks/useLocalStorage';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';
import GoalCard from '@/components/GoalCard';
import SurvivalGoalCard from '@/components/SurvivalGoalCard';
import AddGoalDialog from '@/components/AddGoalDialog';
import ExpenseDialog from '@/components/ExpenseDialog';
import TransactionList from '@/components/TransactionList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast-utils';

const Index = () => {
  // Local storage for goals and transactions
  const [goals, setGoals, clearGoals] = useLocalStorage<Goal[]>('goals', []);
  const [transactions, setTransactions, clearTransactions] = useLocalStorage<Transaction[]>('transactions', []);

  // Dialog states
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  
  // Alert Dialog states
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  // Check if on mobile
  const isMobile = useIsMobile();

  // Find survival goal
  const survivalGoal = goals.find(g => g.type === 'survival');

  // Handle adding a new goal
  const handleAddGoal = (newGoal: Goal) => {
    // Check if editing existing goal
    if (isEditingGoal && selectedGoalId) {
      setGoals(prevGoals => prevGoals.map(g => 
        g.id === selectedGoalId ? { ...newGoal, id: selectedGoalId } : g
      ));
      setIsEditingGoal(false);
      toast.success('Цель успешно обновлена');
    } 
    // If adding a survival goal and one already exists, update it
    else if (newGoal.type === 'survival' && survivalGoal) {
      setGoals(prevGoals => prevGoals.map(g => 
        g.id === survivalGoal.id ? newGoal : g
      ));
      toast.success('Цель выживания обновлена');
    } 
    // If adding a new goal
    else {
      setGoals(prevGoals => [...prevGoals, newGoal]);
      toast.success('Новая цель создана');
    }
    
    setSelectedGoalId(undefined);
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
  const handleAddIncome = (goalId: string, amount: number, description: string = 'Пополнение бюджета') => {
    const updatedGoal = goals.find(g => g.id === goalId);
    if (!updatedGoal) return;
    
    // For survival goals, adding income means reducing the currentAmount (spent amount)
    // No need to limit to 0, allow adding funds beyond the original budget
    setGoals(prevGoals => prevGoals.map(goal => goal.id === goalId ? {
      ...goal,
      currentAmount: goal.currentAmount - amount
    } : goal));
    
    // Record the transaction with negative amount (income)
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      goalId,
      amount: -amount, // negative amount represents income
      description, // Use the provided description
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

  // Open edit dialog for a goal
  const handleEditGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    setSelectedGoalId(goalId);
    setIsEditingGoal(true);
    setIsAddGoalOpen(true);
  };
  
  // Open delete confirmation
  const handleOpenDeleteConfirmation = (goalId: string) => {
    setGoalToDelete(goalId);
    setIsDeleteAlertOpen(true);
  };
  
  // Delete goal
  const handleDeleteGoal = () => {
    if (!goalToDelete) return;
    
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalToDelete));
    
    // Optionally, also delete related transactions
    setTransactions(prevTransactions => 
      prevTransactions.filter(transaction => transaction.goalId !== goalToDelete)
    );
    
    setGoalToDelete(null);
    setIsDeleteAlertOpen(false);
    toast.success('Цель удалена');
  };

  // Toggle goal visibility
  const handleToggleHideGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.map(goal => goal.id === goalId ? {
      ...goal,
      hidden: !goal.hidden
    } : goal));
  };

  // Функция для очистки всех данных
  const handleClearAllData = () => {
    clearGoals();
    clearTransactions();
    toast.success('Все данные успешно очищены');
  };

  // Filter visible goals (exclude survival goal as it's displayed separately)
  const visibleStandardGoals = goals.filter(goal => !goal.hidden && goal.type !== 'survival');
  const visibleSurvivalGoal = survivalGoal && !survivalGoal.hidden ? survivalGoal : null;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onAddGoal={() => setIsAddGoalOpen(true)} 
        goals={goals} 
        transactions={transactions} 
        onAddExpense={handleOpenExpense} 
        onToggleHideGoal={handleToggleHideGoal}
        onEditGoal={handleEditGoal}
        onDeleteGoal={handleOpenDeleteConfirmation}
        onAddIncome={handleAddIncome}
        onClearData={handleClearAllData} 
      />
      
      <main className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* Mobile: Transaction History appears first */}
          {isMobile && (
            <div className="mb-0">
              <ScrollArea className="h-[350px] pr-4 mx-0 my-0 py-0 px-[3px]">
                <TransactionList transactions={transactions} goals={goals} />
              </ScrollArea>
            </div>
          )}
          
          {/* Goals Section */}
          <div className="space-y-4 mx-0 px-0">
            {/* Survival Goal Card */}
            {visibleSurvivalGoal && (
              <SurvivalGoalCard 
                goal={visibleSurvivalGoal} 
                onAddExpense={handleOpenExpense} 
                onAddIncome={handleAddIncome}
                onEditGoal={handleEditGoal}
                onDeleteGoal={handleOpenDeleteConfirmation}
                onToggleHideGoal={handleToggleHideGoal}
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
                  onEditGoal={handleEditGoal}
                  onDeleteGoal={handleOpenDeleteConfirmation}
                  transactions={transactions} 
                  onToggleHideGoal={handleToggleHideGoal} 
                />
              ))}
            </div>
            
            {visibleStandardGoals.length === 0 && !visibleSurvivalGoal && (
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
        onClose={() => {
          setIsAddGoalOpen(false);
          setSelectedGoalId(undefined);
          setIsEditingGoal(false);
        }} 
        onAddGoal={handleAddGoal}
        existingGoal={isEditingGoal && selectedGoalId ? goals.find(g => g.id === selectedGoalId) : undefined}
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
      
      {/* Delete Goal Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить цель?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Цель и все связанные с ней транзакции будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGoalToDelete(null)}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGoal}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
