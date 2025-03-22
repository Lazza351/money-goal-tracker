
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Goal } from '@/interfaces';
import { toast } from '@/components/ui/toast-utils';

interface SurvivalGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Goal) => void;
  existingSurvivalGoal: Goal | undefined;
}

const SurvivalGoalDialog = ({ 
  isOpen, 
  onClose, 
  onAddGoal,
  existingSurvivalGoal
}: SurvivalGoalDialogProps) => {
  const [title, setTitle] = useState(existingSurvivalGoal?.title || 'Выживание');
  const [amount, setAmount] = useState(existingSurvivalGoal?.amount.toString() || '');
  const [periodStart, setPeriodStart] = useState<Date | undefined>(
    existingSurvivalGoal?.periodStart || new Date()
  );
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(
    existingSurvivalGoal?.periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Укажите название цели');
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }
    
    if (!periodStart || !periodEnd) {
      toast.error('Выберите период');
      return;
    }
    
    if (periodStart > periodEnd) {
      toast.error('Дата начала не может быть позже даты окончания');
      return;
    }
    
    // Calculate daily allowance - add 1 to make it inclusive of both start and end dates
    const totalDays = Math.max(1, differenceInDays(periodEnd, periodStart) + 1);
    const dailyAllowance = Number(amount) / totalDays;
    
    const newGoal: Goal = {
      id: existingSurvivalGoal?.id || Date.now().toString(),
      title: title.trim(),
      amount: Number(amount),
      currentAmount: existingSurvivalGoal?.currentAmount || 0,
      deadline: periodEnd,
      createdAt: existingSurvivalGoal?.createdAt || new Date(),
      category: 'Выживание',
      color: '#FF4500', // Orange-red color for survival goals
      type: 'survival',
      periodStart,
      periodEnd,
      dailyAllowance
    };
    
    onAddGoal(newGoal);
    toast.success(existingSurvivalGoal ? 'Цель обновлена' : 'Цель создана');
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    if (!existingSurvivalGoal) {
      setTitle('Выживание');
      setAmount('');
      setPeriodStart(new Date());
      setPeriodEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingSurvivalGoal ? 'Редактировать цель выживания' : 'Создать цель выживания'}</DialogTitle>
          <DialogDescription>
            Установите бюджет на определенный период
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название цели</Label>
              <Input
                id="title"
                placeholder="Например: Выживание"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Доступная сумма на период</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="30000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₽
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата начала</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !periodStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {periodStart ? (
                        format(periodStart, 'PPP', { locale: ru })
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={periodStart}
                      onSelect={setPeriodStart}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Дата окончания</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !periodEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {periodEnd ? (
                        format(periodEnd, 'PPP', { locale: ru })
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={periodEnd}
                      onSelect={setPeriodEnd}
                      initialFocus
                      disabled={(date) => date < (periodStart || new Date())}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">{existingSurvivalGoal ? 'Обновить' : 'Создать'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SurvivalGoalDialog;
