import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import PortfolioPage from "./PortfolioPage.tsx";
import AdminDashboard from "./AdminDashboard.tsx";

const RootPage = window.location.pathname.startsWith("/dashboard")
  ? AdminDashboard
  : PortfolioPage;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootPage />
  </StrictMode>,
);
