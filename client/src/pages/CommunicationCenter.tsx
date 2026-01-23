import { Outlet, useLocation, Link } from 'react-router';
import { Mail, MessageSquare, Phone, History, Users, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function CommunicationCenter() {
  const location = useLocation();
  const isOverview = location.pathname === '/communication';

  // If we're on the overview page, show the dashboard
  if (isOverview) {
    const stats = [
      {
        title: 'Messages Sent Today',
        value: '12',
        icon: Mail,
        color: 'bg-blue-100 text-blue-700',
      },
      {
        title: 'Active Recipients',
        value: '487',
        icon: Users,
        color: 'bg-green-100 text-green-700',
      },
      {
        title: 'Total Groups',
        value: '12',
        icon: Users,
        color: 'bg-purple-100 text-purple-700',
      },
      {
        title: 'This Month',
        value: '156',
        icon: History,
        color: 'bg-orange-100 text-orange-700',
      },
    ];

    const quickActions = [
      {
        title: 'Compose Message',
        description: 'Send a new email, SMS, or robocall',
        icon: Mail,
        href: '/communication/compose',
        color: 'bg-blue-600 hover:bg-blue-700',
      },
      {
        title: 'View History',
        description: 'See all sent communications',
        icon: History,
        href: '/communication/history',
        color: 'bg-purple-600 hover:bg-purple-700',
      },
      {
        title: 'Manage Groups',
        description: 'Create and edit contact groups with PINs',
        icon: Users,
        href: '/communication/groups',
        color: 'bg-green-600 hover:bg-green-700',
      },
    ];

    const recentActivity = [
      { type: 'email', subject: 'Monthly Tuition Reminder', date: '2024-11-24', recipients: 487 },
      { type: 'sms', subject: 'Early Dismissal Tomorrow', date: '2024-11-23', recipients: 487 },
      { type: 'call', subject: 'Snow Day Announcement', date: '2024-11-20', recipients: 487 },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-gray-900 mb-2">Communication Center</h1>
          <p className="text-gray-600">Manage mass communications with parents and staff</p>
        </div>

        {/* Quick Send via Text Feature */}
        <Alert className="bg-blue-50 border-blue-200">
          <Smartphone className="size-4 text-blue-700" />
          <AlertDescription className="text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-blue-900">
                  <strong>Quick Send:</strong> Text <strong className="font-mono">+1 (833) 000-0000</strong> with PIN + message for instant mass communications
                </p>
                <p className="text-xs text-gray-600 mt-1 font-mono">Example: 1234 School closes early today at 2pm</p>
              </div>
              <Link 
                to="/communication/groups" 
                className="text-sm text-blue-700 hover:text-blue-800 underline whitespace-nowrap"
              >
                View PINs →
              </Link>
            </div>
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`size-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="size-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className={`${action.color} text-white p-6 rounded-lg transition-all hover:shadow-lg`}
                >
                  <Icon className="size-8 mb-3" />
                  <h3 className="text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-white/90">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">Recent Activity</h2>
              <Link to="/communication/history" className="text-sm text-blue-700 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    {activity.type === 'email' && <Mail className="size-5 text-blue-700" />}
                    {activity.type === 'sms' && <MessageSquare className="size-5 text-blue-700" />}
                    {activity.type === 'call' && <Phone className="size-5 text-blue-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">{activity.subject}</p>
                    <p className="text-sm text-gray-500">
                      {activity.date} • {activity.recipients} recipients
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For sub-routes, render the outlet
  return <Outlet />;
}

