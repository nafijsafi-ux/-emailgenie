import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import LandingPage from "@/pages/landing";
import GeneratorPage from "@/pages/generator";
import ComparisonPage from "@/pages/comparison";
import HistoryPage from "@/pages/history";
import ReportPage from "@/pages/report";
import SharePage from "@/pages/share";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <Switch>
      <Route path="/share/:id" component={SharePage} />
      <Route path="/" component={LandingPage} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/generate" component={GeneratorPage} />
            <Route path="/comparison" component={ComparisonPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/report" component={ReportPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
