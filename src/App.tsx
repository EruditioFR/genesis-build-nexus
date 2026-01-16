import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import GoogleAnalyticsProvider from "@/components/GoogleAnalyticsProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import CapsuleCreate from "./pages/CapsuleCreate";
import CapsuleEdit from "./pages/CapsuleEdit";
import CapsuleDetail from "./pages/CapsuleDetail";
import CapsulesList from "./pages/CapsulesList";
import Timeline from "./pages/Timeline";
import CirclesPage from "./pages/CirclesPage";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import CalendarPage from "./pages/CalendarPage";
import Premium from "./pages/Premium";
import FamilyTreePage from "./pages/FamilyTreePage";
import FamilyTreeViewPage from "./pages/FamilyTreeViewPage";
import InviteAccept from "./pages/InviteAccept";
import GuardianVerify from "./pages/GuardianVerify";
import GuardianDashboard from "./pages/GuardianDashboard";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import NotFound from "./pages/NotFound";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfSale from "./pages/legal/TermsOfSale";
import TermsOfUse from "./pages/legal/TermsOfUse";
import LegalNotice from "./pages/legal/LegalNotice";
import FAQ from "./pages/FAQ";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCapsules from "./pages/admin/AdminCapsules";
import AdminComments from "./pages/admin/AdminComments";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminStats from "./pages/admin/AdminStats";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="familygarden-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GoogleAnalyticsProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/capsules" element={<CapsulesList />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/capsules/new" element={<CapsuleCreate />} />
                <Route path="/capsules/:id" element={<CapsuleDetail />} />
                <Route path="/capsules/:id/edit" element={<CapsuleEdit />} />
                <Route path="/circles" element={<CirclesPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/family-tree" element={<FamilyTreePage />} />
                <Route path="/family-tree/:id" element={<FamilyTreeViewPage />} />
                <Route path="/invite/:token" element={<InviteAccept />} />
                <Route path="/guardian/verify/:token" element={<GuardianVerify />} />
                <Route path="/guardian-dashboard" element={<GuardianDashboard />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:slug" element={<CategoryDetailPage />} />
                
                {/* Legal pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/cgv" element={<TermsOfSale />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/mentions-legales" element={<LegalNotice />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="capsules" element={<AdminCapsules />} />
                  <Route path="comments" element={<AdminComments />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="stats" element={<AdminStats />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GoogleAnalyticsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
