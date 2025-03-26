
import { Goal, Transaction } from '@/interfaces';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveRestore } from 'lucide-react';
import GoalCard from './GoalCard';
import SurvivalGoalCard from './SurvivalGoalCard';

interface HiddenGoalsSheetProps {
  goals: Goal[];
  transactions: Transaction[];
  onAddExpense: (goalId: string) => void;
  onToggleHideGoal: (goalId: string) => void;
  onEditGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  onAddIncome?: (goalId: string, amount: number, description: string) => void;
}

const HiddenGoalsSheet = ({ 
  goals, 
  transactions, 
  onAddExpense, 
  onToggleHideGoal,
  onEditGoal,
  onDeleteGoal,
  onAddIncome
}: HiddenGoalsSheetProps) => {
  const hiddenGoals = goals.filter(goal => goal.hidden);
  const hiddenStandardGoals = hiddenGoals.filter(goal => goal.type !== 'survival');
  const hiddenSurvivalGoal = hiddenGoals.find(goal => goal.type === 'survival');
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="group flex items-center gap-1.5 rounded-full px-4 transition-all duration-300"
        >
          <span className="md:inline hidden">Скрытые цели</span>
          <Archive className="h-4 w-4 transition-all duration-300 group-hover:rotate-12" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Скрытые цели</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {hiddenGoals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {hiddenSurvivalGoal && onAddIncome && (
                <SurvivalGoalCard 
                  key={hiddenSurvivalGoal.id} 
                  goal={hiddenSurvivalGoal} 
                  onAddExpense={onAddExpense} 
                  onAddIncome={onAddIncome}
                  onEditGoal={onEditGoal || (() => {})}
                  onDeleteGoal={onDeleteGoal}
                  onToggleHideGoal={onToggleHideGoal}
                  isHidden={true}
                  transactions={transactions}
                />
              )}
              
              {hiddenStandardGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onAddExpense={onAddExpense} 
                  onEditGoal={onEditGoal}
                  onDeleteGoal={onDeleteGoal}
                  transactions={transactions}
                  onToggleHideGoal={onToggleHideGoal}
                  isHidden={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium">Нет скрытых целей</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Скрытые и выполненные цели будут отображаться здесь
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default HiddenGoalsSheet;
