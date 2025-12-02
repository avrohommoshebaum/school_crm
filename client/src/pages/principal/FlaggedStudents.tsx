import { useState } from 'react';
import { Search, Plus, AlertTriangle, Flag, TrendingUp, TrendingDown, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export default function FlaggedStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock flagged students data
  const flaggedStudents = [
    {
      id: 1,
      student: 'Miriam Levy',
      grade: '2nd Grade',
      priority: 'urgent',
      category: 'academic',
      issue: 'Math struggles - consistently scoring below grade level',
      description: 'Miriam is having difficulty with basic addition and subtraction. Teacher reports she becomes frustrated during math time and shuts down.',
      flaggedBy: 'Mrs. Friedman',
      flaggedDate: '2024-11-20',
      interventions: ['Math tutor assigned', 'Extra practice worksheets', 'Parent meeting scheduled'],
      status: 'active',
      lastUpdate: '2024-11-24',
      notes: 'Parent agreed to work on flashcards at home. Will reassess in 2 weeks.'
    },
    {
      id: 2,
      student: 'Devorah Klein',
      grade: '3rd Grade',
      priority: 'urgent',
      category: 'behavior',
      issue: 'Classroom disruption - talking during lessons',
      description: 'Devorah frequently talks to classmates during instruction time. When redirected, she becomes argumentative with the teacher.',
      flaggedBy: 'Mrs. Schwartz',
      flaggedDate: '2024-11-21',
      interventions: ['Seat change', 'Behavior chart', 'Daily progress reports'],
      status: 'active',
      lastUpdate: '2024-11-25',
      notes: 'Some improvement noted. Will continue monitoring.'
    },
    {
      id: 3,
      student: 'Rachel Berkowitz',
      grade: '1st Grade',
      priority: 'high',
      category: 'social',
      issue: 'Social challenges - difficulty making friends',
      description: 'Rachel often plays alone at recess and seems withdrawn in group activities.',
      flaggedBy: 'Mrs. Cohen',
      flaggedDate: '2024-11-18',
      interventions: ['Lunch bunch group', 'Social skills support', 'Peer buddy assigned'],
      status: 'improving',
      lastUpdate: '2024-11-23',
      notes: 'Rachel has been participating more in lunch bunch. Parents report she mentions friends\' names at home.'
    },
    {
      id: 4,
      student: 'Esther Rosenberg',
      grade: '2nd Grade',
      priority: 'medium',
      category: 'attendance',
      issue: 'Frequent absences affecting academic progress',
      description: 'Esther has missed 12 days this marking period. Missing key instructional time.',
      flaggedBy: 'Mrs. Klein',
      flaggedDate: '2024-11-15',
      interventions: ['Attendance meeting with parents', 'Makeup work provided', 'Weekly check-ins'],
      status: 'active',
      lastUpdate: '2024-11-22',
      notes: 'Family has medical issues. Providing accommodations and extra support.'
    },
    {
      id: 5,
      student: 'Chaya Friedman',
      grade: '5th Grade',
      priority: 'high',
      category: 'academic',
      issue: 'Reading comprehension below grade level',
      description: 'Chaya struggles with reading comprehension questions and inferencing.',
      flaggedBy: 'Mrs. Goldberg',
      flaggedDate: '2024-11-10',
      interventions: ['Reading tutor 2x/week', 'Audio books provided', 'Extended time on tests'],
      status: 'improving',
      lastUpdate: '2024-11-20',
      notes: 'Reading tutor reports progress. Chaya is more confident with reading strategies.'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'behavior':
        return 'bg-red-100 text-red-800';
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'attendance':
        return 'bg-orange-100 text-orange-800';
      case 'medical':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-orange-100 text-orange-800';
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return '📚';
      case 'behavior':
        return '⚠️';
      case 'social':
        return '👥';
      case 'attendance':
        return '📅';
      case 'medical':
        return '🏥';
      default:
        return '📌';
    }
  };

  const filteredStudents = flaggedStudents.filter(student =>
    student.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFlags = filteredStudents.filter(s => s.status === 'active').length;
  const improvingFlags = filteredStudents.filter(s => s.status === 'improving').length;
  const urgentFlags = filteredStudents.filter(s => s.priority === 'urgent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Flagged Students</h2>
          <p className="text-sm text-gray-600">Students requiring special attention and intervention</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Flag className="size-4 mr-2" />
              Flag Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Flag Student for Attention</DialogTitle>
              <DialogDescription>Document concerns and create intervention plan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Student *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sarah Cohen - 3rd Grade</SelectItem>
                    <SelectItem value="2">Rivka Goldstein - 3rd Grade</SelectItem>
                    <SelectItem value="3">Leah Schwartz - 4th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority Level *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent - Immediate attention needed</SelectItem>
                      <SelectItem value="high">High - Address soon</SelectItem>
                      <SelectItem value="medium">Medium - Monitor closely</SelectItem>
                      <SelectItem value="low">Low - Awareness only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="behavior">Behavior</SelectItem>
                      <SelectItem value="social">Social/Emotional</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issue Summary *</Label>
                <Input placeholder="Brief description of the concern" />
              </div>

              <div className="space-y-2">
                <Label>Detailed Description *</Label>
                <Textarea 
                  placeholder="Provide detailed information about the concern, including specific examples and observations..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Interventions/Action Plan</Label>
                <Textarea 
                  placeholder="List interventions being implemented or planned..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea 
                  placeholder="Any other relevant information..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                  <Flag className="size-4 mr-2" />
                  Flag Student
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Flagged</p>
                <p className="text-gray-900">{flaggedStudents.length}</p>
              </div>
              <Flag className="size-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Concerns</p>
                <p className="text-gray-900">{activeFlags}</p>
              </div>
              <AlertTriangle className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Urgent</p>
                <p className="text-gray-900">{urgentFlags}</p>
              </div>
              <AlertTriangle className="size-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Improving</p>
                <p className="text-gray-900">{improvingFlags}</p>
              </div>
              <TrendingUp className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by student name or concern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Flagged Students List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({filteredStudents.length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({urgentFlags})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeFlags})</TabsTrigger>
          <TabsTrigger value="improving">Improving ({improvingFlags})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className={`border-l-4 ${student.priority === 'urgent' ? 'border-l-red-500' : student.priority === 'high' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{getCategoryIcon(student.category)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-gray-900">{student.student}</h3>
                          <Badge variant="outline">{student.grade}</Badge>
                          <Badge className={getPriorityColor(student.priority)}>
                            {student.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getCategoryColor(student.category)}>
                            {student.category}
                          </Badge>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">{student.issue}</p>
                        <p className="text-sm text-gray-600">{student.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interventions */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-2">Interventions:</p>
                    <ul className="space-y-1">
                      {student.interventions.map((intervention, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{intervention}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes */}
                  {student.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 mb-1">Recent Notes:</p>
                      <p className="text-sm text-gray-700">{student.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Flagged by: {student.flaggedBy}</span>
                      <span>Date: {student.flaggedDate}</span>
                      <span>Last Update: {student.lastUpdate}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Add Note
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit Flag
                      </Button>
                      <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50">
                        {student.status === 'improving' ? 'Mark Resolved' : 'Update Status'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="urgent">
          <div className="space-y-4">
            {filteredStudents.filter(s => s.priority === 'urgent').map((student) => (
              <Card key={student.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <p className="text-gray-900">{student.student} - {student.issue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {filteredStudents.filter(s => s.status === 'active').map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <p className="text-gray-900">{student.student} - {student.issue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="improving">
          <div className="space-y-4">
            {filteredStudents.filter(s => s.status === 'improving').map((student) => (
              <Card key={student.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <p className="text-gray-900">{student.student} - {student.issue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
