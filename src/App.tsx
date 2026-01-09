import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
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
import InviteAccept from "./pages/InviteAccept";
import GuardianVerify from "./pages/GuardianVerify";
import GuardianDashboard from "./pages/GuardianDashboard";
import NotFound from "./pages/NotFound";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfSale from "./pages/legal/TermsOfSale";
import LegalNotice from "./pages/legal/LegalNotice";

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
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="/invite/:token" element={<InviteAccept />} />
              <Route path="/guardian/verify/:token" element={<GuardianVerify />} />
              <Route path="/guardian-dashboard" element={<GuardianDashboard />} />
              
              {/* Legal pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cgv" element={<TermsOfSale />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
