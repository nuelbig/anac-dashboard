
import { Navigate, RouteObject } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Dashboard from "../components/dashoard/Dashboard";

// Incident pages
import IncidentsList from "../components/incidents/IncidentsList";
import CreateIncident from "../components/incidents/CreateIncident";
import IncidentDetails from "../components/incidents/IncidentDetails";
import EditIncident from "../components/incidents/EditIncident";








export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "incidents",
        element: <IncidentsList />,
      },
      {
        path: "incidents/new",
        element: <CreateIncident />,
      },
      {
        path: "incidents/:id",
        element: <IncidentDetails />,
      },
      {
        path: "incidents/:id/edit",
        element: <EditIncident />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
