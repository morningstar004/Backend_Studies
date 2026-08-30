import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              richColors
              theme="system"
              position="bottom-center"
              toastOptions={{
                classNames: {
                  toast:
                    "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#1A1A1B] group-[.toaster]:border group-[.toaster]:border-black/10 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:dark:bg-[#111111] group-[.toaster]:dark:text-[#F8F9FA] group-[.toaster]:dark:border-white/10",
                  title: "text-sm font-semibold",
                  description: "text-xs opacity-80",
                  actionButton: "bg-primary text-white",
                  cancelButton: "bg-black/5 text-black dark:bg-white/10 dark:text-white",
                  closeButton:
                    "bg-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white",
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
