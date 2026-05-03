import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import GoogleAnalyticsProvider from "@/components/GoogleAnalyticsProvider";
import ScrollToTop from "@/components/ScrollToTop";

// Eager load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

// Lazy load non-critical pages to reduce initial bundle size
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));
const CapsuleCreate = lazy(() => import("./pages/CapsuleCreate"));
const CapsuleEdit = lazy(() => import("./pages/CapsuleEdit"));
const CapsuleDetail = lazy(() => import("./pages/CapsuleDetail"));
const CapsulesList = lazy(() => import("./pages/CapsulesList"));
const Timeline = lazy(() => import("./pages/Timeline"));
const CirclesPage = lazy(() => import("./pages/CirclesPage"));
const Profile = lazy(() => import("./pages/Profile"));
const Statistics = lazy(() => import("./pages/Statistics"));

const Premium = lazy(() => import("./pages/Premium"));
const FamilyTreePage = lazy(() => import("./pages/FamilyTreePage"));
const InviteAccept = lazy(() => import("./pages/InviteAccept"));
const GuardianVerify = lazy(() => import("./pages/GuardianVerify"));
const GuardianDashboard = lazy(() => import("./pages/GuardianDashboard"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryDetailPage = lazy(() => import("./pages/CategoryDetailPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const InspirationsPage = lazy(() => import("./pages/InspirationsPage"));
const SharedWithMePage = lazy(() => import("./pages/SharedWithMePage"));
const BetaFeedback = lazy(() => import("./pages/BetaFeedback"));
const Marketing = lazy(() => import("./pages/Marketing"));
const DemoExperience = lazy(() => import("./pages/DemoExperience"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));

// Legal pages - lazy loaded
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfSale = lazy(() => import("./pages/legal/TermsOfSale"));
const TermsOfUse = lazy(() => import("./pages/legal/TermsOfUse"));
const LegalNotice = lazy(() => import("./pages/legal/LegalNotice"));
const FAQ = lazy(() => import("./pages/FAQ"));

// Admin pages - lazy loaded
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCapsules = lazy(() => import("./pages/admin/AdminCapsules"));
const AdminComments = lazy(() => import("./pages/admin/AdminComments"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats"));
const AdminContactMessages = lazy(() => import("./pages/admin/AdminContactMessages"));
const AdminFamilyTrees = lazy(() => import("./pages/admin/AdminFamilyTrees"));
const AdminCloudUsage = lazy(() => import("./pages/admin/AdminCloudUsage"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminCircles = lazy(() => import("./pages/admin/AdminCircles"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));

// Blog pages
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange storageKey="familygarden-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <GoogleAnalyticsProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/email-confirmation" element={<EmailConfirmation />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/capsules" element={<CapsulesList />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/capsules/new" element={<CapsuleCreate />} />
                  <Route path="/capsules/:id" element={<CapsuleDetail />} />
                  <Route path="/capsules/:id/edit" element={<CapsuleEdit />} />
                  <Route path="/circles" element={<CirclesPage />} />
                  <Route path="/shared-with-me" element={<SharedWithMePage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/statistics" element={<Statistics />} />
                  
                  <Route path="/premium" element={<Premium />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/family-tree" element={<FamilyTreePage />} />
                  <Route path="/invite/:token" element={<InviteAccept />} />
                  <Route path="/guardian/verify/:token" element={<GuardianVerify />} />
                  <Route path="/guardian-dashboard" element={<GuardianDashboard />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:slug" element={<CategoryDetailPage />} />
                  <Route path="/inspirations" element={<InspirationsPage />} />
                  <Route path="/beta-feedback" element={<BetaFeedback />} />
                  <Route path="/marketing" element={<Marketing />} />
                  <Route path="/demo" element={<DemoExperience />} />
                  
                  {/* Legal pages */}
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/cgv" element={<TermsOfSale />} />
                  <Route path="/terms" element={<TermsOfUse />} />
                  <Route path="/mentions-legales" element={<LegalNotice />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="capsules" element={<AdminCapsules />} />
                    <Route path="comments" element={<AdminComments />} />
                    <Route path="subscriptions" element={<AdminSubscriptions />} />
                    <Route path="roles" element={<AdminRoles />} />
                    <Route path="stats" element={<AdminStats />} />
                    <Route path="family-trees" element={<AdminFamilyTrees />} />
                    <Route path="cloud-usage" element={<AdminCloudUsage />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="circles" element={<AdminCircles />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="contact" element={<AdminContactMessages />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </GoogleAnalyticsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;