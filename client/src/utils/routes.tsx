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
import ResetPassword from "../pages/ResetPassword";
import ForgotPassword from "../pages/ForgotPassword";
import ForcePasswordChange from "../pages/ForcePasswordChange";
import SchoolSettings from "../pages/admin/SchoolSettings";
import SchoolCalendar from "../pages/admin/SchoolCalendar";
import ApplicationSettings from "../pages/admin/ApplicationSettings";
import AcademicYearSettings from "../pages/admin/AcademicYearSettings";
import SystemSettings from "../pages/admin/SystemSettings";
import ProtectedRoute from "../components/ProtectedRoute";
import composeMessage from "../pages/communication/ComposeMessage";
import SendEmail from "../pages/communication/SendEmail";
import SendSMS from "../pages/communication/SendSMS";
import SendRobocall from "../pages/communication/SendRobocall";
import ManageGroups from "../pages/communication/ManageGroups";
import MessageHistory from "../pages/communication/MessageHistory";

import Students from "../pages/Students";
import StudentProfile from "../pages/StudentProfile";

import Teachers from "../pages/Teachers";

import MyClasses from "../pages/teacher/MyClasses";
import TeacherAttendance from "../pages/teacher/TeacherAttendance";
import TeacherReportCards from "../pages/teacher/TeacherReportCards";

import Classes from "../pages/Classes";
import Applications from "../pages/Applications";
import ApplicationForm from "../pages/ApplicationForm";
import ReportCards from "../pages/ReportCards";

import PrincipalCenter from "../pages/PrincipalCenter";
import StudentLogs from "../pages/principal/StudentLogs";
import FlaggedStudents from "../pages/principal/FlaggedStudents";
import ParentMeetings from "../pages/principal/ParentMeetings";
import BehaviorTracking from "../pages/principal/BehaviorTracking";
import AcademicConcerns from "../pages/principal/AcademicConcerns";


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

  { path: "/forgot-password", Component: ForgotPassword },
{ path: "/reset-password", Component: ResetPassword },

{
  path: "/",
  element: <ProtectedRoute />,
  
  children: [
    {
      path: "/",              
      element: <LayoutMUI />,
      children: [
        {
          index: true,
          Component: AdminDashboard,
        },
        { path: "force-password-change", Component: ForcePasswordChange },
        { path: "profile", Component: ProfilePage },
        { path: "settings", Component: SettingsPage },


        {path: "students", Component: Students },
        { path: 'students/:id', Component: StudentProfile },

        { path: 'teachers', Component: Teachers },

        { path: 'teacher-center/my-classes', Component: MyClasses },
        { path: 'teacher-center/attendance', Component: TeacherAttendance },
        { path: 'teacher-center/report-cards', Component: TeacherReportCards },

        { path: 'classes', Component: Classes },
        { path: 'applications', Component: Applications }, 
        { path: 'applications/new', Component: ApplicationForm },
        { path: 'report-cards', Component: ReportCards },



         {
          path: "communication",
          element:   <ProtectedRoute
      permission={{ module: "communications", action: "view" }}
    />,
          children: [
            { index: true, Component: composeMessage },
            { path: "email", Component: SendEmail },
            { path: "sms", Component: SendSMS }, 
            { path: "robocall", Component: SendRobocall },
            { path: "groups", Component: ManageGroups }, 
            { path: "history", Component: MessageHistory }
          ]
        },

         {
        path: 'principal',
        Component: PrincipalCenter,
        children: [
          { path: 'student-logs', Component: StudentLogs },
          { path: 'flagged-students', Component: FlaggedStudents },
          { path: 'parent-meetings', Component: ParentMeetings },
          { path: 'behavior-tracking', Component: BehaviorTracking },
          { path: 'academic-concerns', Component: AcademicConcerns },
        ],
      },

        {
          path: "admin",
          element:   <ProtectedRoute
      permission={{ module: "users", action: "view" }}
    />,
          children: [
            { index: true, Component: AdminDashboard },
            { path: "users", Component: UserManagement },
            { path: "roles", Component: RoleManagement },
            { path: "school-settings", Component: SchoolSettings },
            { path: "school-calendar", Component: SchoolCalendar },
            {path: "application-settings", Component: ApplicationSettings},
            {path: "academic-year", Component: AcademicYearSettings},
            {path: "system-settings", Component: SystemSettings},
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
