// src/utils/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import LayoutMUI from "../components/LayoutMUI";

import Login from "../pages/Login";
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RoleManagement from '../pages/admin/RoleManagement';


function NotFound() {
  return (
    <Box sx={{ p: 8 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary">
        The page you're looking for doesn't exist.
      </Typography>
    </Box>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
    {
    path: '/',
    Component: LayoutMUI,
    children: [
  { path: 'admin', Component: AdminDashboard },
      { path: 'admin/users', Component: UserManagement },
      { path: 'admin/roles', Component: RoleManagement },
    ],
  },
   
       {   path: "*", Component: NotFound,},
]);
