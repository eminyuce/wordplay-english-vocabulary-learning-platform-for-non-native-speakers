import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Toaster } from "./components/ui/sonner";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FeedbackPage from "./pages/FeedbackPage";
import HomePage from "./pages/HomePage";
import LanguagePage from "./pages/LanguagePage";

const queryClient = new QueryClient();

// Layout component that includes Header and Footer
function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const languageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/language/$language",
  component: LanguagePage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const feedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feedback",
  component: FeedbackPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  languageRoute,
  analyticsRoute,
  feedbackRoute,
  adminLoginRoute,
  adminDashboardRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold mb-2">Loading WordPlay</h2>
            <p className="text-muted-foreground text-sm">
              Preparing your learning experience...
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <RouterProvider router={router} />
        </AdminAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
