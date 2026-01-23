// Widget Renderer - Maps widget IDs to their components - Updated 2026-01-05
import TotalStudentsWidget from './widgets/TotalStudentsWidget';
import TodaysAttendanceWidget from './widgets/TodaysAttendanceWidget';
import PendingApplicationsWidget from './widgets/PendingApplicationsWidget';
import OutstandingTuitionWidget from './widgets/OutstandingTuitionWidget';
import MyClassesWidget from './widgets/MyClassesWidget';
import FlaggedStudentsWidget from './widgets/FlaggedStudentsWidget';
import RecentActivityWidget from './widgets/RecentActivityWidget';
import RecentMessagesWidget from './widgets/RecentMessagesWidget';
import UpcomingEventsWidget from './widgets/UpcomingEventsWidget';
import QuickActionsTeacherWidget from './widgets/QuickActionsTeacherWidget';
import QuickActionsPrincipalWidget from './widgets/QuickActionsPrincipalWidget';
import QuickActionsBusinessWidget from './widgets/QuickActionsBusinessWidget';
import AbsentStudentsWidget from './widgets/AbsentStudentsWidget';
import ReportCardsDueWidget from './widgets/ReportCardsDueWidget';
import RecentDonationsWidget from './widgets/RecentDonationsWidget';
import AttendanceChartWidget from './widgets/AttendanceChartWidget';
import FinancialOverviewWidget from './widgets/FinancialOverviewWidget';

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  TotalStudentsWidget,
  TodaysAttendanceWidget,
  PendingApplicationsWidget,
  OutstandingTuitionWidget,
  MyClassesWidget,
  FlaggedStudentsWidget,
  RecentActivityWidget,
  RecentMessagesWidget,
  UpcomingEventsWidget,
  QuickActionsTeacherWidget,
  QuickActionsPrincipalWidget,
  QuickActionsBusinessWidget,
  AbsentStudentsWidget,
  ReportCardsDueWidget,
  RecentDonationsWidget,
  AttendanceChartWidget,
  FinancialOverviewWidget,
};

interface WidgetRendererProps {
  componentName: string;
}

export default function WidgetRenderer({ componentName }: WidgetRendererProps) {
  const Component = WIDGET_COMPONENTS[componentName];
  
  if (!Component) {
    return <div>Widget not found: {componentName}</div>;
  }
  
  return <Component />;
}

