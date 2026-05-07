import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/store/notifications";

export function NotificationsBell() {
  const { itens, marcarLidas } = useNotifications();
  const naoLidas = itens.filter((i) => !i.lida).length;
  return (
    <Popover onOpenChange={(o) => o && marcarLidas()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {naoLidas > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {naoLidas}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <p className="font-display font-bold text-sm">Notificações</p>
          <p className="text-xs text-muted-foreground">Movimentações das sugestões</p>
        </div>
        <div className="max-h-80 overflow-auto divide-y divide-border">
          {itens.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">Sem notificações.</p>}
          {itens.map((n) => (
            <div key={n.id} className="p-3 hover:bg-muted/40">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-primary-deep">{n.titulo}</p>
                <span className="text-[10px] text-muted-foreground">{n.data}</span>
              </div>
              <p className="text-xs mt-1">{n.mensagem}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Para: {n.destinatario}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
