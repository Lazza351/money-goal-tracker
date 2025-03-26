
import { useState } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import SettingsDialog from './SettingsDialog';
import HiddenGoalsSheet from './HiddenGoalsSheet';
import { 
  PlusCircle, 
  MoreVertical, 
  ArrowDownCircle, 
  Menu, 
  Settings, 
  Eye, 
  EyeOff, 
  FileEdit, 
  Trash2, 
  PiggyBank 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavbarProps {
  onAddGoal: () => void;
  onAddExpense: (goalId: string) => void;
  onEditGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleHideGoal: (goalId: string) => void;
  onAddIncome: (goalId: string, amount: number, description: string) => void;
  onClearData: () => void;
  goals: Goal[];
  transactions: Transaction[];
}

const Navbar = ({ 
  onAddGoal, 
  onAddExpense, 
  onEditGoal, 
  onDeleteGoal, 
  onToggleHideGoal, 
  onAddIncome,
  onClearData,
  goals, 
  transactions 
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Only allow selecting goals that are not hidden for quick actions
  const visibleGoals = goals.filter(goal => !goal.hidden);
  
  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <h1 className="text-xl font-semibold">Мои Финансовые Цели</h1>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <SheetHeader className="mb-4">
              <SheetTitle>Мои Финансовые Цели</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="flex flex-col gap-4 py-2">
                <Button
                  variant="default"
                  onClick={() => {
                    onAddGoal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить новую цель
                </Button>
                
                {visibleGoals.length > 0 && (
                  <>
                    <p className="text-sm font-medium text-muted-foreground px-1 pt-2">
                      Быстрые действия с целями
                    </p>
                    
                    {visibleGoals.map(goal => (
                      <div key={goal.id} className="space-y-1 border-b pb-3">
                        <p className="text-sm font-medium truncate px-1">
                          {goal.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onAddExpense(goal.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className="h-8"
                          >
                            <ArrowDownCircle className="mr-1 h-3.5 w-3.5" />
                            Добавить расход
                          </Button>
                          
                          {goal.type === 'survival' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Open add income in a different way
                                // We'll close the menu and expect the caller to handle this
                                setIsMobileMenuOpen(false);
                                // Set up a minimal deposit for now, this will be modified in a separate component
                                onAddIncome(goal.id, 1000, "Пополнение бюджета");
                              }}
                              className="h-8"
                            >
                              <PiggyBank className="mr-1 h-3.5 w-3.5" />
                              Пополнить
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onEditGoal(goal.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className="h-8"
                          >
                            <FileEdit className="mr-1 h-3.5 w-3.5" />
                            Изменить
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onToggleHideGoal(goal.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className="h-8"
                          >
                            <EyeOff className="mr-1 h-3.5 w-3.5" />
                            Скрыть
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button 
              onClick={onAddGoal} 
              className="h-9 w-full md:w-auto gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline-block">Новая цель</span>
              <span className="sm:hidden">Цель</span>
            </Button>
          </div>
          
          <HiddenGoalsSheet 
            goals={goals} 
            transactions={transactions} 
            onAddExpense={onAddExpense} 
            onToggleHideGoal={onToggleHideGoal}
            onEditGoal={onEditGoal}
            onDeleteGoal={onDeleteGoal}
            onAddIncome={onAddIncome}
          />
          
          <div className="flex items-center">
            {visibleGoals.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    aria-label="More Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Действия с целями</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {visibleGoals.map(goal => (
                    <DropdownMenuItem 
                      key={goal.id}
                      onSelect={() => onAddExpense(goal.id)}
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4" />
                      <span>Добавить расход: {goal.title}</span>
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  
                  {visibleGoals.map(goal => (
                    <DropdownMenuItem 
                      key={`edit-${goal.id}`}
                      onSelect={() => onEditGoal(goal.id)}
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      <span>Изменить: {goal.title}</span>
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  
                  {visibleGoals.map(goal => (
                    <DropdownMenuItem 
                      key={`visibility-${goal.id}`}
                      onSelect={() => onToggleHideGoal(goal.id)}
                    >
                      <EyeOff className="mr-2 h-4 w-4" />
                      <span>Скрыть: {goal.title}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <ThemeToggle />
            <SettingsDialog onClearData={onClearData} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
