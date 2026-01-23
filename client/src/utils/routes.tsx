// src/utils/routes.tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import LayoutMUI from "../components/LayoutMUI";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy load all page components for code splitting
const Login = lazy(() => import("../pages/Login"));
const AcceptInvite = lazy(() => import("../pages/invite/AcceptInvite"));
const InviteSuccess = lazy(() => import("../pages/invite/InviteSuccess"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"));
const StaffManagement = lazy(() => import("../pages/admin/StaffManagement"));
const RoleManagement = lazy(() => import("../pages/admin/RoleManagement"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/profile/SettingsPage"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ForcePasswordChange = lazy(() => import("../pages/ForcePasswordChange"));
const Setup2FA = lazy(() => import("../pages/2FA/Setup2FA"));
const Verify2FA = lazy(() => import("../pages/2FA/Verify2FA"));
const Enforce2FA = lazy(() => import("../pages/2FA/Enforce2FA"));
const SchoolSettings = lazy(() => import("../pages/admin/SchoolSettings"));
const SchoolCalendar = lazy(() => import("../pages/admin/SchoolCalendar"));
const ApplicationSettings = lazy(() => import("../pages/admin/ApplicationSettings"));
const AcademicYearSettings = lazy(() => import("../pages/admin/AcademicYearSettings"));
const SystemSettings = lazy(() => import("../pages/admin/SystemSettings"));
const CommunicationDashboard = lazy(() => import("../pages/communication/CommunicationDashboard"));
const composeMessage = lazy(() => import("../pages/communication/ComposeMessage"));
const SendEmail = lazy(() => import("../pages/communication/SendEmail"));
const SendSMS = lazy(() => import("../pages/communication/SendSMS"));
const SendRobocall = lazy(() => import("../pages/communication/SendRobocall"));
const QuickCompose = lazy(() => import("../pages/communication/QuickCompose"));
const ManageGroups = lazy(() => import("../pages/communication/ManageGroups"));
const MessageHistory = lazy(() => import("../pages/communication/MessageHistory"));
const Students = lazy(() => import("../pages/Students"));
const StudentProfile = lazy(() => import("../pages/StudentProfile"));
const Families = lazy(() => import("../pages/Families"));
const Staff = lazy(() => import("../pages/Staff"));
const Teachers = lazy(() => import("../pages/Teachers"));
const MyClasses = lazy(() => import("../pages/teacher/MyClasses"));
const TeacherAttendance = lazy(() => import("../pages/teacher/TeacherAttendance"));
const TeacherReportCards = lazy(() => import("../pages/teacher/TeacherReportCards"));
const Classes = lazy(() => import("../pages/Classes"));
const Applications = lazy(() => import("../pages/Applications"));
const ApplicationForm = lazy(() => import("../pages/ApplicationForm"));
const ReportCards = lazy(() => import("../pages/ReportCards"));
const PrincipalCenter = lazy(() => import("../pages/principal/PrincipalCenter"));
const HeadPrincipal = lazy(() => import("../pages/headprincipal/HeadPrincipal"));
const HeadPrincipalCenter = lazy(() => import("../pages/headprincipal/HeadPrincipalCenter"));
const DivisionOverview = lazy(() => import("../pages/headprincipal/AllGradesView"));
const DivisionDetail = lazy(() => import("../pages/headprincipal/DivisionDetail"));
const GradeAssignments = lazy(() => import("../pages/headprincipal/GradeAssignments"));
const ProgressTracking = lazy(() => import("../pages/headprincipal/ProgressTracking"));
const PrincipalManagement = lazy(() => import("../pages/headprincipal/PrincipalManagement"));
const AllClassesView = lazy(() => import("../pages/headprincipal/AllClassesView"));
const AllStudentsView = lazy(() => import("../pages/headprincipal/AllStudentsView"));
const GradeManagement = lazy(() => import("../pages/headprincipal/GradeManagement"));
const DivisionManagement = lazy(() => import("../pages/headprincipal/DivisionManagement"));
const GradeDetail = lazy(() => import("../pages/headprincipal/GradeDetail"));
const GradeView = lazy(() => import("../pages/principal/GradeView"));
const ClassView = lazy(() => import("../pages/principal/ClassView"));
const StudentView = lazy(() => import("../pages/principal/StudentView"));
const StudentLogs = lazy(() => import("../pages/principal/StudentLogs"));
const FlaggedStudents = lazy(() => import("../pages/principal/FlaggedStudents"));
const ParentMeetings = lazy(() => import("../pages/principal/ParentMeetings"));
const BehaviorTracking = lazy(() => import("../pages/principal/BehaviorTracking"));
const AcademicConcerns = lazy(() => import("../pages/principal/AcademicConcerns"));
const BusinessOfficeCenter = lazy(() => import("../pages/BusinessOfficeCenter"));
const TuitionManagement = lazy(() => import("../pages/business/TuitionManagement"));
const Donations = lazy(() => import("../pages/business/Donations"));
const Transportation = lazy(() => import("../pages/business/Transportation"));
const FinancialReports = lazy(() => import("../pages/business/FinancialReports"));
const FamilyStudentImport = lazy(() => import("../pages/business/FamilyStudentImport"));
const ImportCenter = lazy(() => import("../pages/admin/ImportCenter"));


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

// Loading component for Suspense
function LoadingFallback() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

// Wrapper component to add Suspense to lazy-loaded routes
function LazyRoute({ Component }: { Component: React.LazyExoticComponent<React.ComponentType<any>> }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/invite/accept",
    element: <LazyRoute Component={AcceptInvite} />,
  },
  {
    path: "/invite/success",
    element: <LazyRoute Component={InviteSuccess} />,
  },
  {
    path: "/login",
    element: <LazyRoute Component={Login} />,
  },
  {
    path: "/forgot-password",
    element: <LazyRoute Component={ForgotPassword} />,
  },
  {
    path: "/reset-password",
    element: <LazyRoute Component={ResetPassword} />,
  },
  {
    path: "/2fa/setup",
    element: <LazyRoute Component={Setup2FA} />,
  },
  {
    path: "/2fa/verify",
    element: <LazyRoute Component={Verify2FA} />,
  },
  {
    path: "/2fa/enforce",
    element: <LazyRoute Component={Enforce2FA} />,
  },
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
            element: <LazyRoute Component={Dashboard} />,
          },
          {
            path: "force-password-change",
            element: <LazyRoute Component={ForcePasswordChange} />,
          },
          {
            path: "profile",
            element: <LazyRoute Component={ProfilePage} />,
          },
          {
            path: "settings",
            element: <LazyRoute Component={SettingsPage} />,
          },
          {
            path: "students",
            element: <LazyRoute Component={Students} />,
          },
          {
            path: "students/:id",
            element: <LazyRoute Component={StudentProfile} />,
          },
          {
            path: "families",
            element: <LazyRoute Component={Families} />,
          },
          {
            path: "staff",
            element: <LazyRoute Component={Staff} />,
          },
          {
            path: "teachers",
            element: <LazyRoute Component={Teachers} />,
          },
          {
            path: "teacher-center/my-classes",
            element: <LazyRoute Component={MyClasses} />,
          },
          {
            path: "teacher-center/attendance",
            element: <LazyRoute Component={TeacherAttendance} />,
          },
          {
            path: "teacher-center/report-cards",
            element: <LazyRoute Component={TeacherReportCards} />,
          },
          {
            path: "classes",
            element: <LazyRoute Component={Classes} />,
          },
          {
            path: "applications",
            element: <LazyRoute Component={Applications} />,
          },
          {
            path: "applications/new",
            element: <LazyRoute Component={ApplicationForm} />,
          },
          {
            path: "report-cards",
            element: <LazyRoute Component={ReportCards} />,
          },
          {
            path: "communication",
            element: (
              <ProtectedRoute
                permission={{ module: "communications", action: "view" }}
              />
            ),
            children: [
              {
                index: true,
                element: <LazyRoute Component={CommunicationDashboard} />,
              },
              {
                path: "compose",
                element: <LazyRoute Component={composeMessage} />,
              },
              {
                path: "quick-compose",
                element: <LazyRoute Component={QuickCompose} />,
              },
              {
                path: "email",
                element: <LazyRoute Component={SendEmail} />,
              },
              {
                path: "sms",
                element: <LazyRoute Component={SendSMS} />,
              },
              {
                path: "robocall",
                element: <LazyRoute Component={SendRobocall} />,
              },
              {
                path: "groups",
                element: <LazyRoute Component={ManageGroups} />,
              },
              {
                path: "history",
                element: <LazyRoute Component={MessageHistory} />,
              },
            ],
          },
          {
            path: "principal",
            children: [
              {
                index: true,
                element: <LazyRoute Component={PrincipalCenter} />,
              },
              {
                path: "head-principal",
                element: (
                  <ProtectedRoute permission={{ module: "headPrincipal", action: "view" }} />
                ),
                children: [
                  {
                    index: true,
                    element: <LazyRoute Component={HeadPrincipalCenter} />,
                  },
                  {
                    path: "management",
                    element: <LazyRoute Component={HeadPrincipal} />,
                  },
                  {
                    path: "division-overview",
                    element: <LazyRoute Component={DivisionOverview} />,
                  },
                  {
                    path: "division/:id",
                    element: <LazyRoute Component={DivisionDetail} />,
                  },
                  {
                    path: "grade-assignments",
                    element: <LazyRoute Component={GradeAssignments} />,
                  },
                  {
                    path: "progress-tracking",
                    element: <LazyRoute Component={ProgressTracking} />,
                  },
                  {
                    path: "principal-management",
                    element: <LazyRoute Component={PrincipalManagement} />,
                  },
                  {
                    path: "grade-management",
                    element: <LazyRoute Component={GradeManagement} />,
                  },
                  {
                    path: "division-management",
                    element: <LazyRoute Component={DivisionManagement} />,
                  },
                  {
                    path: "all-classes",
                    element: <LazyRoute Component={AllClassesView} />,
                  },
                  {
                    path: "all-students",
                    element: <LazyRoute Component={AllStudentsView} />,
                  },
                  {
                    path: "grade/:id",
                    element: <LazyRoute Component={GradeDetail} />,
                  },
                  {
                    path: "class/:id",
                    element: <LazyRoute Component={ClassView} />,
                  },
                ],
              },
              {
                path: "grades/:gradeId",
                element: <LazyRoute Component={GradeView} />,
              },
              {
                path: "classes/:classId",
                element: <LazyRoute Component={ClassView} />,
              },
              {
                path: "students/:studentId",
                element: <LazyRoute Component={StudentView} />,
              },
              {
                path: "student-logs",
                element: <LazyRoute Component={StudentLogs} />,
              },
              {
                path: "flagged-students",
                element: <LazyRoute Component={FlaggedStudents} />,
              },
              {
                path: "parent-meetings",
                element: <LazyRoute Component={ParentMeetings} />,
              },
              {
                path: "behavior-tracking",
                element: <LazyRoute Component={BehaviorTracking} />,
              },
              {
                path: "academic-concerns",
                element: <LazyRoute Component={AcademicConcerns} />,
              },
            ],
          },
          {
            path: "business-office",
            children: [
              {
                index: true,
                element: <LazyRoute Component={BusinessOfficeCenter} />,
              },
              {
                path: "tuition",
                element: <LazyRoute Component={TuitionManagement} />,
              },
              {
                path: "donations",
                element: <LazyRoute Component={Donations} />,
              },
              {
                path: "transportation",
                element: <LazyRoute Component={Transportation} />,
              },
              {
                path: "reports",
                element: <LazyRoute Component={FinancialReports} />,
              },
              {
                path: "import",
                element: <LazyRoute Component={FamilyStudentImport} />,
              },
            ],
          },
          {
            path: "admin",
            element: (
              <ProtectedRoute permission={{ module: "users", action: "view" }} />
            ),
            children: [
              {
                index: true,
                element: <LazyRoute Component={AdminDashboard} />,
              },
              {
                path: "users",
                element: <LazyRoute Component={UserManagement} />,
              },
              {
                path: "staff",
                element: <LazyRoute Component={StaffManagement} />,
              },
              {
                path: "roles",
                element: <LazyRoute Component={RoleManagement} />,
              },
              {
                path: "school-settings",
                element: <LazyRoute Component={SchoolSettings} />,
              },
              {
                path: "school-calendar",
                element: <LazyRoute Component={SchoolCalendar} />,
              },
              {
                path: "application-settings",
                element: <LazyRoute Component={ApplicationSettings} />,
              },
              {
                path: "academic-year",
                element: <LazyRoute Component={AcademicYearSettings} />,
              },
              {
                path: "system-settings",
                element: <LazyRoute Component={SystemSettings} />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

// 🚨 Export a COMPONENT, NOT the router object
export default function AppRouter() {
  return <RouterProvider router={router} />;
}

