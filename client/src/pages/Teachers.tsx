import { useState } from 'react';
import { Search, Plus, Mail, Phone, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function Teachers() {
  const [searchQuery, setSearchQuery] = useState('');

  const teachers = [
    {
      id: 1,
      name: 'Mrs. Schwartz',
      hebrewName: 'מרת שוורץ',
      email: 'rschwartz@nachlasby.com',
      phone: '(732) 555-2468',
      grade: '3rd Grade',
      class: 'A',
      subject: 'General Studies',
      students: 24,
      experience: '12 years',
      status: 'active'
    },
    {
      id: 2,
      name: 'Mrs. Goldberg',
      hebrewName: 'מרת גולדברג',
      email: 'sgoldberg@nachlasby.com',
      phone: '(732) 555-3579',
      grade: '4th Grade',
      class: 'B',
      subject: 'Limudei Kodesh',
      students: 22,
      experience: '8 years',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mrs. Klein',
      hebrewName: 'מרת קליין',
      email: 'cklein@nachlasby.com',
      phone: '(732) 555-4680',
      grade: '5th Grade',
      class: 'A',
      subject: 'General Studies',
      students: 25,
      experience: '15 years',
      status: 'active'
    },
    {
      id: 4,
      name: 'Mrs. Friedman',
      hebrewName: 'מרת פרידמן',
      email: 'dfriedman@nachlasby.com',
      phone: '(732) 555-5791',
      grade: '2nd Grade',
      class: 'C',
      subject: 'Limudei Kodesh',
      students: 23,
      experience: '6 years',
      status: 'active'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Teachers & Staff</h1>
          <p className="text-gray-600">Manage teaching staff and assignments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <Plus className="size-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>Enter teacher information and assignment details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>English Name</Label>
                  <Input placeholder="Mrs. Cohen" />
                </div>
                <div className="space-y-2">
                  <Label>Hebrew Name</Label>
                  <Input placeholder="מרת כהן" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="teacher@nachlasby.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="(732) 555-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Grade</SelectItem>
                      <SelectItem value="2">2nd Grade</SelectItem>
                      <SelectItem value="3">3rd Grade</SelectItem>
                      <SelectItem value="4">4th Grade</SelectItem>
                      <SelectItem value="5">5th Grade</SelectItem>
                      <SelectItem value="6">6th Grade</SelectItem>
                      <SelectItem value="7">7th Grade</SelectItem>
                      <SelectItem value="8">8th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Studies</SelectItem>
                      <SelectItem value="kodesh">Limudei Kodesh</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">Add Teacher</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search teachers by name, grade, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Teachers</p>
                <p className="text-gray-900">45</p>
              </div>
              <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="size-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Classes</p>
                <p className="text-gray-900">28</p>
              </div>
              <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="size-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Students/Class</p>
                <p className="text-gray-900">23.5</p>
              </div>
              <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="size-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Substitute Needs</p>
                <p className="text-gray-900">2</p>
              </div>
              <div className="size-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="size-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white">
                    {teacher.name.split(' ')[1].charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <p className="text-sm text-gray-600">{teacher.hebrewName}</p>
                  </div>
                </div>
                <Badge variant="default">{teacher.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Grade & Class</p>
                  <p className="text-sm text-gray-900">
                    {teacher.grade} - {teacher.class}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Subject</p>
                  <p className="text-sm text-gray-900">{teacher.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Students</p>
                  <p className="text-sm text-gray-900">{teacher.students}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Experience</p>
                  <p className="text-sm text-gray-900">{teacher.experience}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="size-3 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="size-3 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
