
import { Navigate, RouteObject } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
//import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Dashboard from "../components/dashoard/Dashboard";
import Departments from "../components/incidents/departments";








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
        element: <Departments />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
