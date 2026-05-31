import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarBody } from "./Sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open navigation"
          className="md:hidden interactive h-10 w-10 rounded-xl glass grid place-items-center hover:bg-white/10 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-3 w-[280px] sm:max-w-[280px] bg-background border-r border-white/10">
        <SidebarBody onNavigate={() => setOpen(false)} layoutId="mobile-nav-active" />
      </SheetContent>
    </Sheet>
  );
}
