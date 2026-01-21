// Widget Registry - Defines all available widgets and their permissions

export interface Widget {
  id: string;
  title: string;
  description: string;
  category: 'stats' | 'activity' | 'quick-actions' | 'lists' | 'charts';
  requiredPermissions: string[];
  defaultSize: 'small' | 'medium' | 'large';
  component: string; // Component name to render
}

export const WIDGET_REGISTRY: Widget[] = [
  // Stats Widgets
  {
    id: 'total-students',
    title: 'Total Students',
    description: 'View total number of enrolled students',
    category: 'stats',
    requiredPermissions: ['view_students'],
    defaultSize: 'small',
    component: 'TotalStudentsWidget',
  },
  {
    id: 'todays-attendance',
    title: "Today's Attendance",
    description: 'View attendance statistics for today',
    category: 'stats',
    requiredPermissions: ['view_attendance'],
    defaultSize: 'small',
    component: 'TodaysAttendanceWidget',
  },
  {
    id: 'pending-applications',
    title: 'Pending Applications',
    description: 'Number of applications awaiting review',
    category: 'stats',
    requiredPermissions: ['manage_applications'],
    defaultSize: 'small',
    component: 'PendingApplicationsWidget',
  },
  {
    id: 'outstanding-tuition',
    title: 'Outstanding Tuition',
    description: 'Total outstanding tuition payments',
    category: 'stats',
    requiredPermissions: ['manage_tuition'],
    defaultSize: 'small',
    component: 'OutstandingTuitionWidget',
  },
  {
    id: 'my-classes',
    title: 'My Classes',
    description: 'Number of classes you teach',
    category: 'stats',
    requiredPermissions: ['view_classes'],
    defaultSize: 'small',
    component: 'MyClassesWidget',
  },
  {
    id: 'flagged-students',
    title: 'Flagged Students',
    description: 'Students requiring attention',
    category: 'stats',
    requiredPermissions: ['view_student_flags'],
    defaultSize: 'small',
    component: 'FlaggedStudentsWidget',
  },

  // Activity Widgets
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    description: 'Latest system activity and updates',
    category: 'activity',
    requiredPermissions: [],
    defaultSize: 'medium',
    component: 'RecentActivityWidget',
  },
  {
    id: 'recent-messages',
    title: 'Recent Messages',
    description: 'Latest messages from parents and staff',
    category: 'activity',
    requiredPermissions: ['view_communication'],
    defaultSize: 'medium',
    component: 'RecentMessagesWidget',
  },
  {
    id: 'upcoming-events',
    title: 'Upcoming Events',
    description: 'School events and important dates',
    category: 'activity',
    requiredPermissions: [],
    defaultSize: 'medium',
    component: 'UpcomingEventsWidget',
  },

  // Quick Actions
  {
    id: 'quick-actions-teacher',
    title: 'Quick Actions',
    description: 'Common teacher actions',
    category: 'quick-actions',
    requiredPermissions: ['view_classes'],
    defaultSize: 'medium',
    component: 'QuickActionsTeacherWidget',
  },
  {
    id: 'quick-actions-principal',
    title: 'Quick Actions',
    description: 'Common principal actions',
    category: 'quick-actions',
    requiredPermissions: ['manage_students'],
    defaultSize: 'medium',
    component: 'QuickActionsPrincipalWidget',
  },
  {
    id: 'quick-actions-business',
    title: 'Quick Actions',
    description: 'Common business office actions',
    category: 'quick-actions',
    requiredPermissions: ['manage_tuition'],
    defaultSize: 'medium',
    component: 'QuickActionsBusinessWidget',
  },

  // Lists
  {
    id: 'absent-students',
    title: 'Absent Students Today',
    description: 'List of students absent today',
    category: 'lists',
    requiredPermissions: ['view_attendance'],
    defaultSize: 'medium',
    component: 'AbsentStudentsWidget',
  },
  {
    id: 'report-cards-due',
    title: 'Report Cards Due',
    description: 'Upcoming report card deadlines',
    category: 'lists',
    requiredPermissions: ['manage_report_cards'],
    defaultSize: 'medium',
    component: 'ReportCardsDueWidget',
  },
  {
    id: 'recent-donations',
    title: 'Recent Donations',
    description: 'Latest donations received',
    category: 'lists',
    requiredPermissions: ['manage_donations'],
    defaultSize: 'medium',
    component: 'RecentDonationsWidget',
  },

  // Charts
  {
    id: 'attendance-chart',
    title: 'Attendance Trends',
    description: 'Weekly attendance statistics',
    category: 'charts',
    requiredPermissions: ['view_attendance'],
    defaultSize: 'large',
    component: 'AttendanceChartWidget',
  },
  {
    id: 'financial-overview',
    title: 'Financial Overview',
    description: 'Monthly financial summary',
    category: 'charts',
    requiredPermissions: ['view_financial_reports'],
    defaultSize: 'large',
    component: 'FinancialOverviewWidget',
  },
];

// Default dashboard configurations for each role
export const DEFAULT_DASHBOARDS: Record<string, string[]> = {
  admin: [
    'total-students',
    'todays-attendance',
    'pending-applications',
    'outstanding-tuition',
    'recent-activity',
    'quick-actions-principal',
    'attendance-chart',
  ],
  principal: [
    'total-students',
    'todays-attendance',
    'pending-applications',
    'flagged-students',
    'recent-activity',
    'quick-actions-principal',
    'absent-students',
  ],
  teacher: [
    'my-classes',
    'todays-attendance',
    'recent-activity',
    'quick-actions-teacher',
    'absent-students',
    'report-cards-due',
  ],
  business_office: [
    'outstanding-tuition',
    'recent-donations',
    'pending-applications',
    'quick-actions-business',
    'financial-overview',
  ],
  parent: [
    'my-classes',
    'upcoming-events',
    'recent-messages',
  ],
};

// Helper function to get available widgets for a user based on their permissions
export function getAvailableWidgets(userPermissions: string[]): Widget[] {
  return WIDGET_REGISTRY.filter((widget) => {
    // If widget has no required permissions, it's available to everyone
    if (widget.requiredPermissions.length === 0) {
      return true;
    }
    // Check if user has at least one of the required permissions
    return widget.requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
  });
}

// Helper function to get default widgets for a role
export function getDefaultWidgetsForRole(role: string, userPermissions: string[]): string[] {
  const defaultWidgets = DEFAULT_DASHBOARDS[role] || DEFAULT_DASHBOARDS['teacher'];
  const availableWidgets = getAvailableWidgets(userPermissions);
  const availableWidgetIds = availableWidgets.map((w) => w.id);
  
  // Filter default widgets to only include those the user has permission for
  return defaultWidgets.filter((widgetId) => availableWidgetIds.includes(widgetId));
}
