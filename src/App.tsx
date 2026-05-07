import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import { RequirePerm } from "./components/RequirePerm";
import Dashboard from "./pages/Dashboard";
import NovaIdeia from "./pages/NovaIdeia";
import Kanban from "./pages/Kanban";
import IdeaDetail from "./pages/IdeaDetail";
import Comite from "./pages/Comite";
import Entendimento from "./pages/Entendimento";
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
            <Route path="/nova" element={<RequirePerm module="nova"><NovaIdeia /></RequirePerm>} />
            <Route path="/kanban" element={<RequirePerm module="kanban"><Kanban /></RequirePerm>} />
            <Route path="/ideia/:id" element={<IdeaDetail />} />
            <Route path="/entendimento" element={<RequirePerm module="entendimento"><Entendimento /></RequirePerm>} />
            <Route path="/comite" element={<RequirePerm module="comite"><Comite /></RequirePerm>} />
            <Route path="/implementacao" element={<RequirePerm module="implementacao"><Implementacao /></RequirePerm>} />
            <Route path="/campanhas" element={<RequirePerm module="campanhas"><Campanhas /></RequirePerm>} />
            <Route path="/ranking" element={<RequirePerm module="ranking"><Ranking /></RequirePerm>} />
            <Route path="/admin" element={<RequirePerm module="admin"><Admin /></RequirePerm>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
