import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BookOpen, TrendingDown, AlertCircle } from 'lucide-react';

export default function AcademicConcerns() {
  const concerns = [
    {
      id: 1,
      student: 'Miriam Levy',
      grade: '2nd Grade',
      subject: 'Math',
      issue: 'Below grade level in addition/subtraction',
      intervention: 'Math tutor assigned',
      priority: 'high'
    },
    {
      id: 2,
      student: 'Chaya Friedman',
      grade: '5th Grade',
      subject: 'Reading',
      issue: 'Reading comprehension struggles',
      intervention: 'Reading tutor 2x/week',
      priority: 'medium'
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Academic Concerns</h2>
          <p className="text-sm text-gray-600">Track students requiring academic support</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <BookOpen className="size-4 mr-2" />
          Add Concern
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Concerns</p>
                <p className="text-gray-900">{concerns.length}</p>
              </div>
              <AlertCircle className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">With Tutors</p>
                <p className="text-gray-900">2</p>
              </div>
              <BookOpen className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">High Priority</p>
                <p className="text-gray-900">1</p>
              </div>
              <TrendingDown className="size-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {concerns.map((concern) => (
          <Card key={concern.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-gray-900">{concern.student}</h3>
                    <Badge variant="outline">{concern.grade}</Badge>
                    <Badge className="bg-purple-100 text-purple-800">{concern.subject}</Badge>
                    <Badge className={getPriorityColor(concern.priority)}>
                      {concern.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{concern.issue}</p>
                  <p className="text-sm text-gray-600">Intervention: {concern.intervention}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                  <Button variant="outline" size="sm">
                    View Progress
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
