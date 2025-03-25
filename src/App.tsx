
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Define calendar settings context
export type CalendarSettings = {
  weekStartsOnMonday: boolean;
};

export const CalendarSettingsContext = createContext<{
  settings: CalendarSettings;
  updateSettings: (settings: Partial<CalendarSettings>) => void;
}>({
  settings: { weekStartsOnMonday: true },
  updateSettings: () => {},
});

const queryClient = new QueryClient();

const App = () => {
  const [calendarSettings, setCalendarSettings] = useLocalStorage<CalendarSettings>(
    'calendarSettings', 
    { weekStartsOnMonday: true }
  );

  const updateSettings = (newSettings: Partial<CalendarSettings>) => {
    setCalendarSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CalendarSettingsContext.Provider value={{ 
        settings: calendarSettings, 
        updateSettings 
      }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CalendarSettingsContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
