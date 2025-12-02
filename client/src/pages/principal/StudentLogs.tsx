import { useState } from 'react';
import { Search, Plus, Filter, Calendar, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function StudentLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock log data
  const logs = [
    {
      id: 1,
      student: 'Sarah Cohen',
      grade: '3rd Grade',
      type: 'parent-meeting',
      title: 'Discussion about reading progress',
      description: 'Met with Mrs. Cohen to discuss Sarah\'s reading improvement. She has shown significant progress this quarter. Recommended continuing with reading tutor.',
      date: '2024-11-25',
      time: '2:30 PM',
      author: 'Mrs. Schwartz (Principal)',
      followUp: true,
      followUpDate: '2024-12-10'
    },
    {
      id: 2,
      student: 'Rivka Goldstein',
      grade: '3rd Grade',
      type: 'behavior',
      title: 'Behavioral concern - classroom disruption',
      description: 'Rivka has been talking during class and distracting other students. Spoke with her about classroom expectations. Will monitor for improvement.',
      date: '2024-11-24',
      time: '11:00 AM',
      author: 'Mrs. Schwartz (Principal)',
      followUp: true,
      followUpDate: '2024-12-01'
    },
    {
      id: 3,
      student: 'Leah Schwartz',
      grade: '4th Grade',
      type: 'parent-call',
      title: 'Phone call with mother regarding attendance',
      description: 'Discussed Leah\'s recent absences. Family dealing with illness. Will provide makeup work and extra support upon return.',
      date: '2024-11-23',
      time: '4:15 PM',
      author: 'Mrs. Klein (Principal)',
      followUp: false
    },
    {
      id: 4,
      student: 'Chaya Friedman',
      grade: '5th Grade',
      type: 'academic',
      title: 'Math tutoring recommendation',
      description: 'After reviewing test scores, recommended math tutoring for Chaya. Parents agreed to enroll her in after-school program starting next week.',
      date: '2024-11-22',
      time: '3:00 PM',
      author: 'Mrs. Klein (Principal)',
      followUp: true,
      followUpDate: '2024-12-15'
    },
    {
      id: 5,
      student: 'Miriam Levy',
      grade: '2nd Grade',
      type: 'parent-meeting',
      title: 'General check-in meeting',
      description: 'Routine parent-teacher meeting. Miriam is doing excellent academically and socially. Parents are very pleased with her progress.',
      date: '2024-11-21',
      time: '1:30 PM',
      author: 'Mrs. Friedman (Principal)',
      followUp: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'parent-meeting':
        return 'bg-blue-100 text-blue-800';
      case 'parent-call':
        return 'bg-green-100 text-green-800';
      case 'behavior':
        return 'bg-orange-100 text-orange-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'parent-meeting':
        return 'Parent Meeting';
      case 'parent-call':
        return 'Phone Call';
      case 'behavior':
        return 'Behavior';
      case 'academic':
        return 'Academic';
      default:
        return type;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Student Logs</h2>
          <p className="text-sm text-gray-600">Track interactions, meetings, and important notes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <Plus className="size-4 mr-2" />
              Add Log Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Log Entry</DialogTitle>
              <DialogDescription>Record a conversation, meeting, or important note about a student</DialogDescription>
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
                    <SelectItem value="4">Chaya Friedman - 5th Grade</SelectItem>
                    <SelectItem value="5">Miriam Levy - 2nd Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Log Type *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent-meeting">Parent Meeting</SelectItem>
                    <SelectItem value="parent-call">Phone Call</SelectItem>
                    <SelectItem value="behavior">Behavior Concern</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="general">General Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="Brief summary of the log" />
              </div>

              <div className="space-y-2">
                <Label>Date & Time *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" />
                  <Input type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Details *</Label>
                <Textarea 
                  placeholder="Detailed description of the conversation, meeting, or concern..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="followUp" className="size-4" />
                  <Label htmlFor="followUp">Requires follow-up</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input type="date" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-blue-700 hover:bg-blue-800">
                  Save Log Entry
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by student name or log title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="parent-meeting">Parent Meetings</SelectItem>
                <SelectItem value="parent-call">Phone Calls</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Logs</p>
                <p className="text-gray-900">{logs.length}</p>
              </div>
              <MessageSquare className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-gray-900">3</p>
              </div>
              <Calendar className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Follow-ups</p>
                <p className="text-gray-900">3</p>
              </div>
              <Filter className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Students</p>
                <p className="text-gray-900">5</p>
              </div>
              <User className="size-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{log.title}</h3>
                    <Badge className={getTypeColor(log.type)}>
                      {getTypeLabel(log.type)}
                    </Badge>
                    {log.followUp && (
                      <Badge variant="outline" className="border-orange-500 text-orange-700">
                        Follow-up Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="size-4" />
                      {log.student} - {log.grade}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {log.date} at {log.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{log.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Logged by: {log.author}</p>
                    {log.followUp && (
                      <p className="text-xs text-orange-600">
                        Follow-up: {log.followUpDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm">
                  Edit Log
                </Button>
                <Button variant="outline" size="sm">
                  View Student Profile
                </Button>
                {log.followUp && (
                  <Button variant="outline" size="sm" className="ml-auto text-green-700 border-green-300 hover:bg-green-50">
                    Mark Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No logs found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
