// src/utils/routes.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import LayoutMUI from "../components/LayoutMUI";
import Login from "../pages/Login";

import AcceptInvite from "../pages/invite/AcceptInvite";
import InviteSuccess from "../pages/invite/InviteSuccess";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import RoleManagement from "../pages/admin/RoleManagement";
import ProfilePage from "../pages/profile/ProfilePage";
import SettingsPage from "../pages/profile/SettingsPage";

import ProtectedRoute from "../components/ProtectedRoute";

function NotFound() {
  return (
    <Box sx={{ p: 8 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography color="text.secondary">
        The page you're looking for doesn't exist.
      </Typography>
    </Box>
  );
}

const router = createBrowserRouter([
  {
  path: "/invite/accept",
  Component: AcceptInvite,
},

  {path: "/invite/success",
   Component: InviteSuccess},

  { path: "/login", Component: Login },

{
  path: "/",
  element: <ProtectedRoute />,
  children: [
    {
      path: "/",              // <-- This line MUST be added!
      element: <LayoutMUI />,
      children: [
        {
          index: true,
          Component: AdminDashboard,
        },

        { path: "profile", Component: ProfilePage },
        { path: "settings", Component: SettingsPage },

        {
          path: "admin",
          element:   <ProtectedRoute
      permission={{ module: "users", action: "view" }}
    />,
          children: [
            { index: true, Component: AdminDashboard },
            { path: "users", Component: UserManagement },
            { path: "roles", Component: RoleManagement },
          ],
        },
      ],
    },
  ],
}, 


  { path: "*", Component: NotFound },
]);

// 🚨 Export a COMPONENT, NOT the router object
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
