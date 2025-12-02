import { Users, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router';

export default function Dashboard() {
  const stats = [
    { name: 'Total Students', value: '487', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { name: 'Pending Messages', value: '12', icon: MessageSquare, color: 'bg-green-100 text-green-700' },
    { name: 'Report Cards Due', value: '8', icon: FileText, color: 'bg-purple-100 text-purple-700' },
    { name: 'Attendance Today', value: '98%', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  ];

  const quickActions = [
    { name: 'Send Communication', href: '/communication', color: 'bg-blue-700' },
    { name: 'View Students', href: '/students', color: 'bg-green-700' },
    { name: 'Manage Report Cards', href: '/report-cards', color: 'bg-purple-700' },
    { name: 'Business Office', href: '/business-office', color: 'bg-orange-700' },
  ];

  const recentActivity = [
    { title: 'New application submitted', time: '2 hours ago', type: 'application' },
    { title: 'Report cards sent to 3rd grade', time: '5 hours ago', type: 'report' },
    { title: 'Monthly tuition reminder sent', time: '1 day ago', type: 'communication' },
    { title: '15 students marked absent', time: '2 days ago', type: 'attendance' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Here's what's happening with your school today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} size-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="size-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.name} to={action.href}>
                  <Button className={`w-full h-20 ${action.color} hover:opacity-90`}>
                    {action.name}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="size-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-gray-900">Parent-Teacher Conferences</p>
                <p className="text-sm text-gray-600">December 15, 2024 • 3:00 PM - 7:00 PM</p>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-gray-900">Winter Break Begins</p>
                <p className="text-sm text-gray-600">December 23, 2024</p>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
