
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Category, DEFAULT_CATEGORIES, Goal } from '@/interfaces';
import { toast } from '@/components/ui/sonner';

interface AddGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Goal) => void;
}

const AddGoalDialog = ({ isOpen, onClose, onAddGoal }: AddGoalDialogProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>(DEFAULT_CATEGORIES[0]);
  
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
      id: Date.now().toString(),
      title: title.trim(),
      amount: Number(amount),
      currentAmount: 0,
      deadline,
      createdAt: new Date(),
      category: selectedCategory.name,
      color: selectedCategory.color,
    };
    
    onAddGoal(newGoal);
    toast.success('Цель создана');
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setSelectedCategory(DEFAULT_CATEGORIES[0]);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Создать новую финансовую цель</DialogTitle>
          <DialogDescription>
            Определите цель, сумму и срок достижения
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название цели</Label>
              <Input
                id="title"
                placeholder="Например: Новый ноутбук"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Необходимая сумма</Label>
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
            
            <div className="space-y-2">
              <Label>Срок достижения</Label>
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
            <Button type="submit">Создать цель</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalDialog;
