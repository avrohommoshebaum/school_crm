import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock student data
  const students = [
    { id: 1, name: 'Sarah Cohen', grade: '3rd Grade', class: 'A', status: 'enrolled', attendance: '98%' },
    { id: 2, name: 'Rivka Goldstein', grade: '3rd Grade', class: 'A', status: 'enrolled', attendance: '95%' },
    { id: 3, name: 'Leah Schwartz', grade: '4th Grade', class: 'B', status: 'enrolled', attendance: '97%' },
    { id: 4, name: 'Chaya Friedman', grade: '5th Grade', class: 'A', status: 'enrolled', attendance: '99%' },
    { id: 5, name: 'Miriam Levy', grade: '2nd Grade', class: 'C', status: 'enrolled', attendance: '96%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Students</h1>
          <p className="text-gray-600">Manage student information and records</p>
        </div>
        <Button className="bg-blue-700 hover:bg-blue-800">
          <Plus className="size-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search students by name, ID, or grade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="size-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid grid-cols-1 gap-4">
        {students.map((student) => (
          <Link key={student.id} to={`/students/${student.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{student.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{student.grade}</span>
                        <span>•</span>
                        <span>Class {student.class}</span>
                        <span>•</span>
                        <span>Attendance: {student.attendance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{student.status}</Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}