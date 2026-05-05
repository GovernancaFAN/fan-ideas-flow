import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import NovaIdeia from "./pages/NovaIdeia";
import Kanban from "./pages/Kanban";
import IdeaDetail from "./pages/IdeaDetail";
import Comite from "./pages/Comite";
import Implementacao from "./pages/Implementacao";
import Campanhas from "./pages/Campanhas";
import Ranking from "./pages/Ranking";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nova" element={<NovaIdeia />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/ideia/:id" element={<IdeaDetail />} />
            <Route path="/comite" element={<Comite />} />
            <Route path="/implementacao" element={<Implementacao />} />
            <Route path="/campanhas" element={<Campanhas />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
