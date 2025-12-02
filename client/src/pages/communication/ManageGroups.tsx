import { useState } from 'react';
import { Users, Plus, Hash, Copy, Check, Smartphone, Phone, MessageSquare, Edit2, Eye, UserPlus, Upload, X, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';

type Group = {
  id: string;
  name: string;
  count: number;
  description: string;
  pin: string;
  members?: Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
  }>;
};

export default function ManageGroups() {
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [managingMembersGroup, setManagingMembersGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const groups: Group[] = [
    { 
      id: '1', 
      name: 'All Parents', 
      count: 487, 
      description: 'All parent contacts', 
      pin: '1001',
      members: [
        { id: '1', name: 'Sarah Cohen', phone: '(732) 555-0101', email: 'sarah@example.com' },
        { id: '2', name: 'Rachel Goldberg', phone: '(732) 555-0102', email: 'rachel@example.com' },
        { id: '3', name: 'Miriam Levy', phone: '(732) 555-0103', email: 'miriam@example.com' },
        { id: '4', name: 'Esther Friedman', phone: '(732) 555-0104' },
        { id: '5', name: 'Chaya Klein', phone: '(732) 555-0105', email: 'chaya@example.com' },
      ]
    },
    { 
      id: '2', 
      name: '1st Grade Parents', 
      count: 65, 
      description: 'Parents of 1st grade students', 
      pin: '1234',
      members: [
        { id: '1', name: 'David Schwartz', phone: '(732) 555-0201', email: 'david@example.com' },
        { id: '2', name: 'Leah Rosen', phone: '(732) 555-0202' },
        { id: '3', name: 'Yael Shapiro', phone: '(732) 555-0203', email: 'yael@example.com' },
      ]
    },
    { id: '3', name: '2nd Grade Parents', count: 72, description: 'Parents of 2nd grade students', pin: '1235' },
    { id: '4', name: '3rd Grade Parents', count: 68, description: 'Parents of 3rd grade students', pin: '1236' },
    { id: '5', name: '4th Grade Parents', count: 71, description: 'Parents of 4th grade students', pin: '1237' },
    { id: '6', name: '5th Grade Parents', count: 69, description: 'Parents of 5th grade students', pin: '1238' },
    { id: '7', name: '6th Grade Parents', count: 70, description: 'Parents of 6th grade students', pin: '1239' },
    { id: '8', name: '7th Grade Parents', count: 72, description: 'Parents of 7th grade students', pin: '1240' },
    { 
      id: '9', 
      name: 'Staff Members', 
      count: 45, 
      description: 'All staff contacts', 
      pin: '2001',
      members: [
        { id: '1', name: 'Mrs. Baila Horowitz', phone: '(732) 555-0301', email: 'baila@nby.edu' },
        { id: '2', name: 'Mrs. Rivka Stein', phone: '(732) 555-0302', email: 'rivka@nby.edu' },
        { id: '3', name: 'Mrs. Shira Weiss', phone: '(732) 555-0303', email: 'shira@nby.edu' },
      ]
    },
    { id: '10', name: 'Bus Route 1', count: 35, description: 'Students on bus route 1', pin: '3001' },
    { id: '11', name: 'Bus Route 2', count: 42, description: 'Students on bus route 2', pin: '3002' },
    { id: '12', name: 'After School Program', count: 89, description: 'Students enrolled in after school', pin: '4001' },
  ];

  // System contacts (this would come from your database)
  const systemContacts = [
    // Teachers
    { id: 't1', name: 'Mrs. Baila Horowitz', phone: '(732) 555-0301', email: 'baila@nby.edu', category: 'teacher', type: 'staff' },
    { id: 't2', name: 'Mrs. Rivka Stein', phone: '(732) 555-0302', email: 'rivka@nby.edu', category: 'teacher', type: 'staff' },
    { id: 't3', name: 'Mrs. Shira Weiss', phone: '(732) 555-0303', email: 'shira@nby.edu', category: 'teacher', type: 'staff' },
    { id: 't4', name: 'Mrs. Chana Gold', phone: '(732) 555-0304', email: 'chana@nby.edu', category: 'teacher', type: 'staff' },
    // Parents - Grade 1
    { id: 'p1', name: 'David Schwartz (Father)', phone: '(732) 555-0201', email: 'david@example.com', category: 'father', type: 'parent', grade: '1' },
    { id: 'p2', name: 'Leah Schwartz (Mother)', phone: '(732) 555-0211', email: 'leah@example.com', category: 'mother', type: 'parent', grade: '1' },
    { id: 'p3', name: 'Yakov Rosen (Father)', phone: '(732) 555-0202', category: 'father', type: 'parent', grade: '1' },
    { id: 'p4', name: 'Sarah Rosen (Mother)', phone: '(732) 555-0212', email: 'sarah@example.com', category: 'mother', type: 'parent', grade: '1' },
    // Parents - Grade 2
    { id: 'p5', name: 'Moshe Goldberg (Father)', phone: '(732) 555-0221', email: 'moshe@example.com', category: 'father', type: 'parent', grade: '2' },
    { id: 'p6', name: 'Rachel Goldberg (Mother)', phone: '(732) 555-0231', email: 'rachel@example.com', category: 'mother', type: 'parent', grade: '2' },
    // Students - Grade 1
    { id: 's1', name: 'Chaya Schwartz', phone: '(732) 555-0401', category: 'student', type: 'student', grade: '1' },
    { id: 's2', name: 'Rivka Rosen', phone: '(732) 555-0402', category: 'student', type: 'student', grade: '1' },
    // Students - Grade 2
    { id: 's3', name: 'Esther Goldberg', phone: '(732) 555-0403', category: 'student', type: 'student', grade: '2' },
    { id: 's4', name: 'Miriam Cohen', phone: '(732) 555-0404', category: 'student', type: 'student', grade: '2' },
  ];

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 2000);
    }).catch((err) => {
      console.error('Failed to copy PIN:', err);
      // Fallback: Still show feedback even if copy failed
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 2000);
    });
  };

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleAddSelectedContacts = () => {
    // Logic to add selected contacts to the group
    console.log('Adding contacts:', selectedContacts);
    setSelectedContacts([]);
  };

  const filteredContacts = systemContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    const matchesGrade = filterGrade === 'all' || contact.grade === filterGrade;
    return matchesSearch && matchesCategory && matchesGrade;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Groups</h1>
          <p className="text-gray-600">Create and manage contact groups with PIN codes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto">
              <Plus className="size-4 mr-2" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a custom contact group for targeted communications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input placeholder="Enter group name" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Enter description" />
              </div>
              <div className="space-y-2">
                <Label>PIN Code (4 digits)</Label>
                <Input 
                  placeholder="Enter 4-digit PIN" 
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
                <p className="text-xs text-gray-500">
                  This PIN will be used to send messages to this group via text
                </p>
              </div>
              <Button className="w-full">Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PIN System Explanation - Compact */}
      <Alert className="bg-blue-50 border-blue-200">
        <Smartphone className="size-4 text-blue-700" />
        <AlertDescription className="text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-gray-700">
              <strong className="text-blue-900">Quick Send:</strong> Text <strong className="font-mono text-blue-900">+1 (833) 000-0000</strong> with PIN + message
            </p>
            <span className="hidden sm:inline text-gray-400">•</span>
            <p className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border border-blue-200 inline-block">
              Example: 1234 School closes early today at 2pm
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Contact Groups</CardTitle>
          <CardDescription>All available contact groups with PIN codes ({groups.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Users className="size-8 text-blue-700" />
                    <Badge>{group.count}</Badge>
                  </div>
                  <h3 className="text-gray-900 mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  
                  {/* PIN Display */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="size-4 text-gray-600" />
                        <span className="text-xs text-gray-600">PIN:</span>
                        <span className="font-mono text-blue-900">{group.pin}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => copyPin(group.pin)}
                      >
                        {copiedPin === group.pin ? (
                          <Check className="size-3 text-green-600" />
                        ) : (
                          <Copy className="size-3 text-gray-600" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingGroup(group)}
                    >
                      <Edit2 className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setViewingGroup(group)}
                    >
                      <Eye className="size-3 mr-1" />
                      View
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => setManagingMembersGroup(group)}
                  >
                    <UserPlus className="size-3 mr-1" />
                    Manage Members
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="max-w-md w-[95vw] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Group</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update group information and settings
            </DialogDescription>
          </DialogHeader>
          {editingGroup && (
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Group Name</Label>
                <Input 
                  defaultValue={editingGroup.name}
                  placeholder="Enter group name"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Description</Label>
                <Textarea 
                  defaultValue={editingGroup.description}
                  placeholder="Enter description"
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">PIN Code (4 digits)</Label>
                <Input 
                  defaultValue={editingGroup.pin}
                  placeholder="Enter 4-digit PIN" 
                  maxLength={4}
                  pattern="[0-9]{4}"
                  className="h-9 text-sm"
                />
                <p className="text-xs text-gray-500">
                  This PIN will be used to send messages to this group via text
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm text-gray-700">Group Statistics</Label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Total Members</p>
                    <p className="text-xl sm:text-2xl text-blue-900">{editingGroup.count}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">PIN Code</p>
                    <p className="text-xl sm:text-2xl font-mono text-purple-900">{editingGroup.pin}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 text-sm"
                  onClick={() => setEditingGroup(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-blue-700 hover:bg-blue-800 h-9 text-sm"
                  onClick={() => {
                    // Save changes logic here
                    setEditingGroup(null);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Group Dialog */}
      <Dialog open={!!viewingGroup} onOpenChange={() => setViewingGroup(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="size-4 sm:size-5 text-blue-700" />
              <span className="truncate">{viewingGroup?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {viewingGroup?.description}
            </DialogDescription>
          </DialogHeader>
          
          {viewingGroup && (
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 overflow-y-auto">
              {/* Group Info Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Members</p>
                  <p className="text-lg sm:text-2xl text-blue-900">{viewingGroup.count}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1">PIN Code</p>
                  <p className="text-lg sm:text-2xl font-mono text-purple-900">{viewingGroup.pin}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Status</p>
                  <p className="text-xs sm:text-sm text-green-900 mt-1 sm:mt-2">Active</p>
                </div>
              </div>

              <Separator />

              {/* Quick Send Instructions */}
              <Alert className="bg-blue-50 border-blue-200">
                <Smartphone className="size-3 sm:size-4 text-blue-700" />
                <AlertDescription className="text-xs sm:text-sm">
                  <p className="text-blue-900">
                    <strong>Quick Send:</strong> Text <strong className="font-mono text-xs sm:text-sm">+1 (833) 000-0000</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-1 font-mono">
                    {viewingGroup.pin} Your message here
                  </p>
                </AlertDescription>
              </Alert>

              {/* Members List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs sm:text-sm">Group Members</Label>
                  <Badge variant="secondary" className="text-xs">{viewingGroup.members?.length || viewingGroup.count} members</Badge>
                </div>
                
                <div className="border rounded-lg divide-y max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                  {viewingGroup.members && viewingGroup.members.length > 0 ? (
                    viewingGroup.members.map((member) => (
                      <div key={member.id} className="p-2.5 sm:p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base text-gray-900 truncate">{member.name}</p>
                            <div className="flex flex-col gap-0.5 mt-1">
                              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="size-3 shrink-0" />
                                <span className="truncate">{member.phone}</span>
                              </p>
                              {member.email && (
                                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                  <MessageSquare className="size-3 shrink-0" />
                                  <span className="truncate">{member.email}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                      <Users className="size-10 sm:size-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Members list not available</p>
                      <p className="text-xs mt-1">This group has {viewingGroup.count} members</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 text-sm"
                  onClick={() => setViewingGroup(null)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1 bg-blue-700 hover:bg-blue-800 h-9 text-sm"
                  onClick={() => {
                    setViewingGroup(null);
                    setEditingGroup(viewingGroup);
                  }}
                >
                  <Edit2 className="size-3 sm:size-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Group</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={!!managingMembersGroup} onOpenChange={() => setManagingMembersGroup(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <UserPlus className="size-4 sm:size-5 text-blue-700" />
              <span className="truncate">Manage: {managingMembersGroup?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Add or remove contacts from this group
            </DialogDescription>
          </DialogHeader>

          {managingMembersGroup && (
            <Tabs defaultValue="system" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="system" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">From System</span>
                  <span className="sm:hidden">System</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Add Manually</span>
                  <span className="sm:hidden">Manual</span>
                </TabsTrigger>
                <TabsTrigger value="excel" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Upload Excel</span>
                  <span className="sm:hidden">Excel</span>
                </TabsTrigger>
                <TabsTrigger value="current" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Current Members</span>
                  <span className="sm:hidden">Current</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Add from System */}
              <TabsContent value="system" className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pt-3">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 sm:size-4 text-gray-400" />
                      <Input
                        placeholder="Name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 sm:pl-9 text-sm h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="teacher">Teachers</SelectItem>
                        <SelectItem value="father">Fathers</SelectItem>
                        <SelectItem value="mother">Mothers</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Grade</Label>
                    <Select value={filterGrade} onValueChange={setFilterGrade}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="1">1st Grade</SelectItem>
                        <SelectItem value="2">2nd Grade</SelectItem>
                        <SelectItem value="3">3rd Grade</SelectItem>
                        <SelectItem value="4">4th Grade</SelectItem>
                        <SelectItem value="5">5th Grade</SelectItem>
                        <SelectItem value="6">6th Grade</SelectItem>
                        <SelectItem value="7">7th Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quick Select Buttons */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      const teacherIds = systemContacts.filter(c => c.category === 'teacher').map(c => c.id);
                      setSelectedContacts(teacherIds);
                    }}
                  >
                    <span className="hidden sm:inline">Select All Teachers</span>
                    <span className="sm:hidden">Teachers</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      const parentIds = systemContacts.filter(c => c.type === 'parent').map(c => c.id);
                      setSelectedContacts(parentIds);
                    }}
                  >
                    <span className="hidden sm:inline">Select All Parents</span>
                    <span className="sm:hidden">Parents</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      const fatherIds = systemContacts.filter(c => c.category === 'father').map(c => c.id);
                      setSelectedContacts(fatherIds);
                    }}
                  >
                    <span className="hidden sm:inline">Select All Fathers</span>
                    <span className="sm:hidden">Fathers</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      const motherIds = systemContacts.filter(c => c.category === 'mother').map(c => c.id);
                      setSelectedContacts(motherIds);
                    }}
                  >
                    <span className="hidden sm:inline">Select All Mothers</span>
                    <span className="sm:hidden">Mothers</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      const studentIds = systemContacts.filter(c => c.category === 'student').map(c => c.id);
                      setSelectedContacts(studentIds);
                    }}
                  >
                    <span className="hidden sm:inline">Select All Students</span>
                    <span className="sm:hidden">Students</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-8"
                    onClick={() => setSelectedContacts([])}
                  >
                    Clear
                  </Button>
                </div>

                {/* Selected Count */}
                {selectedContacts.length > 0 && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs sm:text-sm text-blue-900">
                          <strong>{selectedContacts.length}</strong> contact{selectedContacts.length !== 1 ? 's' : ''} selected
                        </span>
                        <Button
                          size="sm"
                          className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto text-xs h-8"
                          onClick={handleAddSelectedContacts}
                        >
                          Add to Group
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Contacts List */}
                <div className="border rounded-lg divide-y max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <div key={contact.id} className="p-2.5 sm:p-3 hover:bg-gray-50 flex items-start gap-2 sm:gap-3">
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => handleToggleContact(contact.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <p className="text-sm sm:text-base text-gray-900 truncate">{contact.name}</p>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {contact.category}
                            </Badge>
                            {contact.grade && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                Gr {contact.grade}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:gap-3 mt-1">
                            <p className="text-xs sm:text-sm text-gray-600">{contact.phone}</p>
                            {contact.email && (
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{contact.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                      <Search className="size-10 sm:size-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No contacts found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Add Manually */}
              <TabsContent value="manual" className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pt-3">
                <Alert>
                  <AlertDescription className="text-xs sm:text-sm">
                    Add a new contact manually. This contact will be saved to the system and added to this group.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 sm:space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">First Name *</Label>
                      <Input placeholder="Enter first name" className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Last Name *</Label>
                      <Input placeholder="Enter last name" className="h-9 text-sm" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-xs sm:text-sm">Phone Numbers (At least one required) *</Label>
                    
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="size-3 sm:size-4 text-blue-600" />
                        Cell Phone
                      </Label>
                      <Input placeholder="(732) 555-0000" type="tel" className="h-9 text-sm" />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="size-3 sm:size-4 text-green-600" />
                        Home Phone
                      </Label>
                      <Input placeholder="(732) 555-0000" type="tel" className="h-9 text-sm" />
                    </div>

                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <span className="text-orange-600">*</span>
                      <span>At least one phone number (cell or home) is required. You can add both.</span>
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Email</Label>
                    <Input placeholder="email@example.com" type="email" className="h-9 text-sm" />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Category *</Label>
                    <Select>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Grade (if applicable)</Label>
                    <Select>
                      <SelectTrigger className="h-9 text-sm">
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
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full bg-blue-700 hover:bg-blue-800 h-9 text-sm">
                    <Plus className="size-3 sm:size-4 mr-2" />
                    Add Contact to Group
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 3: Upload Excel */}
              <TabsContent value="excel" className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pt-3">
                <Alert>
                  <AlertDescription className="text-xs sm:text-sm">
                    Upload an Excel file (.xlsx, .xls) with contact information. At least one phone number (Cell or Home) is required per contact.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 sm:space-y-4 max-w-xl">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="size-10 sm:size-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                    <p className="text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">Drop your Excel file here or click to browse</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Supports .xlsx and .xls files up to 5MB</p>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                      <Upload className="size-3 sm:size-4 mr-2" />
                      Choose File
                    </Button>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Excel Template</Label>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      Download our template to ensure your file is formatted correctly
                    </p>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Download Template
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-xs sm:text-sm">Expected Columns:</Label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5 sm:space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">*</span>
                          <div>
                            <strong>Name</strong> (required) - Full name of contact
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">*</span>
                          <div>
                            <strong>Cell Phone</strong> (required if no Home Phone) - Cell phone number
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">*</span>
                          <div>
                            <strong>Home Phone</strong> (required if no Cell Phone) - Home phone number
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-400">○</span>
                          <div>
                            <strong>Email</strong> (optional) - Email address
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-400">○</span>
                          <div>
                            <strong>Category</strong> (optional) - teacher, father, mother, student, staff, other
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-400">○</span>
                          <div>
                            <strong>Grade</strong> (optional) - 1-7 for grade number
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertDescription className="text-xs sm:text-sm text-orange-900">
                        <strong>Important:</strong> Each contact must have at least one phone number (Cell Phone or Home Phone). You can include both if available.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Example Format:</Label>
                    <div className="overflow-x-auto -mx-1 sm:mx-0">
                      <table className="min-w-full text-[10px] sm:text-xs border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-1 sm:px-2 py-1 text-left whitespace-nowrap">Name</th>
                            <th className="border px-1 sm:px-2 py-1 text-left whitespace-nowrap">Cell</th>
                            <th className="border px-1 sm:px-2 py-1 text-left whitespace-nowrap">Home</th>
                            <th className="border px-1 sm:px-2 py-1 text-left whitespace-nowrap hidden sm:table-cell">Email</th>
                            <th className="border px-1 sm:px-2 py-1 text-left whitespace-nowrap">Cat.</th>
                            <th className="border px-1 sm:px-2 py-1 text-left whitespace-nowrap">Gr.</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap">S. Cohen</td>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap text-[9px] sm:text-xs">(732) 555-0101</td>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap text-[9px] sm:text-xs">(732) 555-0102</td>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap hidden sm:table-cell">sarah@ex...</td>
                            <td className="border px-1 sm:px-2 py-1">mom</td>
                            <td className="border px-1 sm:px-2 py-1">3</td>
                          </tr>
                          <tr>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap">D. Schwartz</td>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap text-[9px] sm:text-xs">(732) 555-0201</td>
                            <td className="border px-1 sm:px-2 py-1"></td>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap hidden sm:table-cell">david@ex...</td>
                            <td className="border px-1 sm:px-2 py-1">dad</td>
                            <td className="border px-1 sm:px-2 py-1">1</td>
                          </tr>
                          <tr>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap">M. Horowitz</td>
                            <td className="border px-1 sm:px-2 py-1"></td>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap text-[9px] sm:text-xs">(732) 555-0301</td>
                            <td className="border px-1 sm:px-2 py-1 whitespace-nowrap hidden sm:table-cell">baila@nby...</td>
                            <td className="border px-1 sm:px-2 py-1">tchr</td>
                            <td className="border px-1 sm:px-2 py-1"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Current Members */}
              <TabsContent value="current" className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Manage current members of this group
                  </p>
                  <Badge className="text-xs">{managingMembersGroup.members?.length || managingMembersGroup.count} members</Badge>
                </div>

                <div className="border rounded-lg divide-y max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                  {managingMembersGroup.members && managingMembersGroup.members.length > 0 ? (
                    managingMembersGroup.members.map((member) => (
                      <div key={member.id} className="p-2.5 sm:p-3 hover:bg-gray-50 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-gray-900 truncate">{member.name}</p>
                          <div className="flex flex-col sm:flex-row sm:gap-3 mt-1">
                            <p className="text-xs sm:text-sm text-gray-600">{member.phone}</p>
                            {member.email && (
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{member.email}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0 h-8 w-8 p-0"
                        >
                          <X className="size-3 sm:size-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 sm:p-8 text-center text-gray-500">
                      <Users className="size-10 sm:size-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No members in this group yet</p>
                      <p className="text-xs mt-1">Add members using the other tabs</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex gap-2 pt-3 sm:pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 h-9 text-sm"
              onClick={() => setManagingMembersGroup(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
