import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';

export default function Applications() {
  const applications = [
    { id: 1, name: 'Rachel Berkowitz', grade: '1st Grade', status: 'pending', date: '2024-11-20' },
    { id: 2, name: 'Devorah Klein', grade: '3rd Grade', status: 'interview scheduled', date: '2024-11-18' },
    { id: 3, name: 'Esther Rosenberg', grade: '2nd Grade', status: 'accepted', date: '2024-11-15' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Student Applications</h1>
          <p className="text-gray-600">Review and manage new student applications</p>
        </div>
        <Link to="/applications/new">
          <Button className="bg-blue-700 hover:bg-blue-800">
            <Plus className="size-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h3 className="text-gray-900 mb-1">{app.name}</h3>
                  <p className="text-sm text-gray-600">
                    {app.grade} • Applied {app.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}