
import { useState, useContext } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Calendar } from 'lucide-react';
import { CalendarSettingsContext } from '@/App';

interface SettingsDialogProps {
  onClearData: () => void;
}

const SettingsDialog = ({ onClearData }: SettingsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings } = useContext(CalendarSettingsContext);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          aria-label="Настройки"
        >
          <Settings2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
          <DialogDescription>
            Настройте приложение под свои нужды
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Основные</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium">Управление данными</h3>
                <p className="text-xs text-muted-foreground">
                  Очистите все данные приложения (цели, транзакции)
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  onClearData();
                  setIsOpen(false);
                }}
              >
                Очистить все данные
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Начало недели</Label>
                <div className="text-xs text-muted-foreground">
                  Выберите с какого дня начинается неделя
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="weekStart" className={!settings.weekStartsOnMonday ? "font-medium" : ""}>Вс</Label>
                <Switch 
                  id="weekStart" 
                  checked={settings.weekStartsOnMonday}
                  onCheckedChange={(checked) => {
                    updateSettings({ weekStartsOnMonday: checked });
                  }}
                />
                <Label htmlFor="weekStart" className={settings.weekStartsOnMonday ? "font-medium" : ""}>Пн</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
