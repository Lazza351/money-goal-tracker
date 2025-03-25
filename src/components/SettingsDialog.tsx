
import { useState, useEffect, useContext } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/components/ui/toast-utils';
import { CalendarSettingsContext } from '../App';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
}

const SettingsDialog = ({ isOpen, onClose, onClearData }: SettingsDialogProps) => {
  const { settings, updateSettings } = useContext(CalendarSettingsContext);
  const [confirmClearData, setConfirmClearData] = useState(false);
  
  const handleToggleWeekStart = (checked: boolean) => {
    updateSettings({ weekStartsOnMonday: checked });
    toast.success(`Календарь будет начинаться с ${checked ? 'понедельника' : 'воскресенья'}`);
  };
  
  const handleClearData = () => {
    if (confirmClearData) {
      onClearData();
      onClose();
      setConfirmClearData(false);
    } else {
      setConfirmClearData(true);
    }
  };
  
  // Reset confirmation state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmClearData(false);
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Настройки приложения</DialogTitle>
          <DialogDescription>
            Настройте параметры приложения под себя
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Calendar Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Настройки календаря
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="week-start">Неделя начинается с понедельника</Label>
                <p className="text-sm text-muted-foreground">
                  При отключении календарь будет начинаться с воскресенья
                </p>
              </div>
              <Switch 
                id="week-start" 
                checked={settings.weekStartsOnMonday}
                onCheckedChange={handleToggleWeekStart}
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Управление данными
            </h3>
            <div>
              <Button 
                variant="outline" 
                className="w-full group flex items-center gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500"
                onClick={handleClearData}
              >
                {confirmClearData ? "Подтвердить удаление" : "Очистить все данные"}
                <Trash2 className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Это действие удалит все цели и транзакции без возможности восстановления
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Закрыть</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
