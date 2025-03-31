
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentDetailPage from "./pages/DocumentDetailPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/:ipfsHash" element={<DocumentDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
