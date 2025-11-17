import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes/Routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// const router = createBrowserRouter(routes);

const router = createBrowserRouter(routes, {
  basename: "/orangeportal",
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
