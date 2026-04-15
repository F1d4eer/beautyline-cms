import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/admin/Login.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import BookingsAdmin from "./pages/admin/BookingsAdmin.tsx";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin.tsx";
import ServicesAdmin from "./pages/admin/ServicesAdmin.tsx";
import ContentAdmin from "./pages/admin/ContentAdmin.tsx";
import NavigationAdmin from "./pages/admin/NavigationAdmin.tsx";
import MediaAdmin from "./pages/admin/MediaAdmin.tsx";
import SectionEditor from "./pages/admin/SectionEditor.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Index />} />

          {/* Admin panel */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingsAdmin />} />
            <Route path="reviews"  element={<ReviewsAdmin />} />
            <Route path="services"  element={<ServicesAdmin />} />
            <Route path="content"   element={<ContentAdmin />} />
            <Route path="content/:sectionId" element={<SectionEditor />} />
            <Route path="navigation" element={<NavigationAdmin />} />
            <Route path="media"     element={<MediaAdmin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
