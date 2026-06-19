import { Link, useLocation } from "wouter";
import { Sparkles, BarChart3, Clock, Scale, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/generate", label: "Generator", icon: Sparkles },
    { href: "/comparison", label: "Comparison", icon: Scale },
    { href: "/history", label: "History", icon: Clock },
    { href: "/report", label: "Report", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2 mr-6 hover:opacity-80 transition-opacity">
            <div className="bg-primary/20 p-1.5 rounded-md">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-lg">EmailGenie</span>
          </Link>
          <nav className="flex items-center space-x-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location === item.href ||
                (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent-foreground",
                    isActive
                      ? "bg-accent/15 text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline-block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative z-0">{children}</main>
    </div>
  );
}
