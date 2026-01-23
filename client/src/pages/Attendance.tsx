import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Attendance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Attendance</h1>
        <p className="text-gray-600">Track and manage student attendance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Present</p>
              <p className="text-gray-900">478 students</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Absent</p>
              <p className="text-gray-900">9 students</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
              <p className="text-gray-900">98.2%</p>
            </div>
          </div>
          <Button className="w-full">
            <Calendar className="size-4 mr-2" />
            Mark Attendance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

