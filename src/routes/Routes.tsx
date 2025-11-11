
import { Navigate, RouteObject } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
//import Dashboard from "../pages/Dashboard";


import NotFound from "../pages/NotFound";
import Messages from "../pages/Messages";
import Dashboard from "../pages/Dashboard";






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
        path: "messages",
        element: <Messages />,
      },
      
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
