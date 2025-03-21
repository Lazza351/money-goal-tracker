import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Goal, Transaction } from '@/interfaces';
import { toast } from '@/components/ui/toast-utils';

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (transaction: Transaction) => void;
  goals: Goal[];
  selectedGoalId?: string;
}

const ExpenseDialog = ({ 
  isOpen, 
  onClose, 
  onAddExpense, 
  goals,
  selectedGoalId 
}: ExpenseDialogProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (isOpen && selectedGoalId) {
      setGoalId(selectedGoalId);
    }
  }, [isOpen, selectedGoalId]);
  
  const selectedGoal = goals.find(g => g.id === goalId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalId) {
      toast.error('Выберите цель');
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      toast.error('Укажите корректную сумму расхода');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Укажите описание расхода');
      return;
    }
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      goalId,
      amount: Number(amount),
      description: description.trim(),
      date: new Date(),
    };
    
    onAddExpense(newTransaction);
    toast.success('Расход добавлен');
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setAmount('');
    setDescription('');
    setGoalId(undefined);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить расход</DialogTitle>
          <DialogDescription>
            Укажите сумму и описание расхода по выбранной цели
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            {!selectedGoalId && (
              <div className="space-y-2">
                <Label htmlFor="goal">Цель</Label>
                <select
                  id="goal"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={goalId || ''}
                  onChange={(e) => setGoalId(e.target.value)}
                >
                  <option value="" disabled>
                    Выберите цель
                  </option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {selectedGoal && (
              <div className="rounded-md bg-secondary/50 p-3">
                <div className="font-medium">{selectedGoal.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Остало��ь: {(selectedGoal.amount - selectedGoal.currentAmount).toLocaleString()} ₽
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма расхода</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₽
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                placeholder="На что потрачены средства"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">Добавить расход</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
