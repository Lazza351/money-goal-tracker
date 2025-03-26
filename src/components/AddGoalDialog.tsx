
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, LifeBuoy, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Category, DEFAULT_CATEGORIES, Goal } from '@/interfaces';
import { toast } from '@/components/ui/toast-utils';

interface AddGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Goal) => void;
  existingGoal?: Goal;
}

const AddGoalDialog = ({ isOpen, onClose, onAddGoal, existingGoal }: AddGoalDialogProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>(DEFAULT_CATEGORIES[0]);
  const [goalType, setGoalType] = useState<'standard' | 'survival'>('standard');
  
  // Initialize form with existing goal data when editing
  useEffect(() => {
    if (existingGoal) {
      setTitle(existingGoal.title);
      setAmount(existingGoal.amount.toString());
      setDeadline(existingGoal.deadline);
      setGoalType(existingGoal.type || 'standard');
      
      // Find and set the correct category
      const category = DEFAULT_CATEGORIES.find(cat => cat.name === existingGoal.category);
      if (category) {
        setSelectedCategory(category);
      }
    } else {
      // Reset to default values when creating a new goal
      setGoalType('standard');
    }
  }, [existingGoal]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Укажите название цели');
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      toast.error('Укажите корректную сумму цели');
      return;
    }
    
    if (!deadline) {
      toast.error('Выберите срок цели');
      return;
    }
    
    const newGoal: Goal = {
      id: existingGoal ? existingGoal.id : Date.now().toString(),
      title: title.trim(),
      amount: Number(amount),
      currentAmount: existingGoal ? existingGoal.currentAmount : 0,
      deadline,
      createdAt: existingGoal ? existingGoal.createdAt : new Date(),
      category: goalType === 'survival' ? 'Выживание' : selectedCategory.name,
      color: goalType === 'survival' ? '#FF4500' : selectedCategory.color,
      hidden: existingGoal ? existingGoal.hidden : false,
      type: goalType,
    };
    
    // Для цели выживания добавляем дополнительные поля
    if (goalType === 'survival') {
      const today = new Date();
      
      // Используем сегодняшний день как начало периода, если создаем новую цель,
      // или сохраняем существующую дату начала, если редактируем
      const startOfMonth = existingGoal?.periodStart || today;
      
      // Используем deadline выбранный пользователем как конец периода,
      // вместо автоматического расчета конца месяца
      const endOfPeriod = deadline;
      
      newGoal.periodStart = startOfMonth;
      newGoal.periodEnd = endOfPeriod;
      
      const daysInPeriod = Math.ceil(
        (endOfPeriod.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1; // Включаем день окончания
      
      newGoal.dailyAllowance = Math.round(Number(amount) / daysInPeriod);
    }
    
    onAddGoal(newGoal);
    toast.success(existingGoal ? 'Цель обновлена' : 'Цель создана');
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setSelectedCategory(DEFAULT_CATEGORIES[0]);
    setGoalType('standard');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingGoal ? 'Редактировать цель' : 'Создать новую финансовую цель'}</DialogTitle>
          <DialogDescription>
            {existingGoal ? 'Измените параметры цели' : 'Определите цель, сумму и срок достижения'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalType">Тип цели</Label>
              <Select
                value={goalType}
                onValueChange={(value) => setGoalType(value as 'standard' | 'survival')}
              >
                <SelectTrigger id="goalType">
                  <SelectValue placeholder="Выберите тип цели" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Обычная цель</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="survival" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <LifeBuoy className="h-4 w-4" />
                      <span>Цель выживания (бюджет)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Название цели</Label>
              <Input
                id="title"
                placeholder={goalType === 'standard' ? "Например: Новый ноутбук" : "Например: Бюджет на месяц"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">
                {goalType === 'standard' ? 'Необходимая сумма' : 'Бюджет на период'}
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₽
                </span>
              </div>
            </div>
            
            {/* Only show category selection for standard goals */}
            {goalType === 'standard' && (
              <div className="space-y-2">
                <Label>Категория</Label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-all duration-200",
                        selectedCategory.id === category.id
                          ? "ring-2 ring-ring"
                          : "hover:bg-secondary"
                      )}
                      style={{ 
                        backgroundColor: `${category.color}15`,
                        color: category.color,
                      }}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {selectedCategory.id === category.id && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>
                {goalType === 'standard' ? 'Срок достижения' : 'Период действия бюджета'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? (
                      format(deadline, 'PPP', { locale: ru })
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">{existingGoal ? 'Сохранить' : 'Создать цель'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalDialog;
