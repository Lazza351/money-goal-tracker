
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Transaction, Goal } from '@/interfaces';
import { toast } from '@/components/ui/toast-utils';

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Transaction) => void;
  goals: Goal[];
  selectedGoalId?: string;
  transactions: Transaction[];
}

const ExpenseDialog = ({ 
  isOpen, 
  onClose, 
  onAddExpense, 
  goals,
  selectedGoalId,
  transactions
}: ExpenseDialogProps) => {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [goalId, setGoalId] = useState<string | undefined>(selectedGoalId);
  
  // Recent descriptions from transactions (for autocomplete)
  const [recentDescriptions, setRecentDescriptions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDescription("");
      setGoalId(selectedGoalId);
      
      // Get recent descriptions from transactions
      const descriptions = [...transactions]
        .filter(t => t.amount > 0) // Only include expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(t => t.description)
        .filter((desc, index, self) => self.indexOf(desc) === index) // Remove duplicates
        .slice(0, 5); // Get the 5 most recent
      
      setRecentDescriptions(descriptions);
    }
  }, [isOpen, selectedGoalId, transactions]);
  
  // Get the selected goal
  const selectedGoal = goalId ? goals.find(g => g.id === goalId) : undefined;
  
  // Check if we're close to the goal amount
  const isCloseToGoal = selectedGoal && 
    selectedGoal.type !== 'survival' && 
    Number(amount) + selectedGoal.currentAmount >= selectedGoal.amount * 0.95;
  
  // Check if this would exceed the goal amount
  const wouldExceedGoal = selectedGoal && 
    selectedGoal.type !== 'survival' && 
    Number(amount) + selectedGoal.currentAmount > selectedGoal.amount;
    
  // Calculate how much over the goal this would be
  const overGoalAmount = wouldExceedGoal && selectedGoal 
    ? (Number(amount) + selectedGoal.currentAmount) - selectedGoal.amount 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!amount || !description || !goalId) {
      toast.error("Заполните все поля");
      return;
    }
    
    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Сумма должна быть положительным числом");
      return;
    }
    
    const newExpense: Transaction = {
      id: Date.now().toString(),
      goalId,
      amount: numAmount,
      description: description.trim(),
      date: new Date()
    };
    
    onAddExpense(newExpense);
    onClose();
    
    // Show appropriate toast
    if (wouldExceedGoal) {
      toast.success("Транзакция добавлена! Цель превышена на " + overGoalAmount?.toLocaleString() + " ₽");
    } else if (isCloseToGoal) {
      toast.success("Транзакция добавлена! Вы близки к достижению цели");
    } else {
      toast.success("Транзакция добавлена");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить транзакцию</DialogTitle>
          <DialogDescription>
            Добавьте информацию о новой транзакции
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {!selectedGoalId && (
            <div className="grid gap-2">
              <Label htmlFor="goal">Цель</Label>
              <select
                id="goal"
                value={goalId || ""}
                onChange={(e) => setGoalId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>Выберите цель</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="amount">Сумма</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="Сумма расхода"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-8"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₽
              </span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <div className="relative">
              <Textarea
                id="description"
                placeholder="Описание расхода"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setShowSuggestions(e.target.value.length > 0 && recentDescriptions.length > 0);
                }}
                onFocus={() => {
                  setShowSuggestions(description.length > 0 && recentDescriptions.length > 0);
                }}
                onBlur={() => {
                  // Delay hiding to allow for clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="resize-none"
                required
              />
              
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-[150px] overflow-auto rounded-md border bg-popover p-1 shadow-md">
                  {recentDescriptions
                    .filter(desc => 
                      desc.toLowerCase().includes(description.toLowerCase()) &&
                      desc.toLowerCase() !== description.toLowerCase()
                    )
                    .map((desc, index) => (
                      <div
                        key={index}
                        className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                        onClick={() => {
                          setDescription(desc);
                          setShowSuggestions(false);
                        }}
                      >
                        {desc}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          
          {wouldExceedGoal && (
            <div className="text-sm text-amber-500">
              Внимание: Эта транзакция превысит цель на {overGoalAmount?.toLocaleString()} ₽
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button type="submit">Добавить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
