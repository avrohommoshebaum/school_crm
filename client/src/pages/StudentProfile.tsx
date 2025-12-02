import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  Heart,
  FileText,
  Bus,
  AlertCircle,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  // Mock student data based on the Student schema
  const student = {
    _id: '1',
    name: { first: 'Sarah', last: 'Cohen' },
    hebrewName: { first: 'שרה', last: 'כהן' },
    nickname: 'Sari',
    DOB: '2015-03-15',
    hebrewBirthDay: { day: '24', month: 'אדר', year: '5775' },
    grade: '3rd Grade',
    class: 'A',
    status: 'enrolled',
    address: {
      street: '123 Main Street',
      city: 'Lakewood',
      state: 'NJ',
      zip: '08701'
    },
    neighborhood: 'Westgate',
    homePhone: '(732) 555-1234',
    parentsMaritalStatus: 'married',
    mother: {
      name: 'Rivka Cohen',
      phone: '(732) 555-5678',
      email: 'rivka.cohen@email.com',
      occupation: 'Teacher'
    },
    father: {
      name: 'Moshe Cohen',
      phone: '(732) 555-9012',
      email: 'moshe.cohen@email.com',
      occupation: 'Accountant'
    },
    siblings: [
      { firstName: 'Leah', lastName: 'Cohen', age: 7, gender: 'female', school: 'Nachlas Bais Yaakov' },
      { firstName: 'Yakov', lastName: 'Cohen', age: 5, gender: 'male', school: 'Lakewood Cheder' }
    ],
    medical: {
      allergies: ['Peanuts', 'Dairy'],
      medications: ['EpiPen as needed'],
      healthConditions: ['Asthma'],
      doctorName: 'Dr. David Levy',
      doctorPhone: '(732) 555-3456',
      insuranceCarrier: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456789',
      emergencyNotes: 'Keep inhaler accessible at all times'
    },
    specialNeeds: {
      hasSpecialNeeds: false,
      description: ''
    },
    shul: {
      name: 'Bais Medrash Govoha',
      ravName: 'Rabbi Steinberg',
      ravPhone: '(732) 555-7890'
    },
    bus: 'Route 5',
    tutors: ['Mrs. Goldberg - Reading'],
    currentSchool: 'Nachlas Bais Yaakov',
    currentMorah: 'Mrs. Schwartz',
    currentMorahPhone: '(732) 555-2468',
    attendance: '98%',
    applicationFee: {
      feeAmount: 175,
      paid: true,
      paidAt: '2024-08-15',
      paymentMethod: 'credit-card'
    },
    notes: [
      { text: 'Excellent student, very dedicated', author: 'Mrs. Schwartz', createdAt: '2024-11-01' },
      { text: 'Parent requested extra reading support', author: 'Principal', createdAt: '2024-10-15' }
    ]
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="size-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-2xl">
              {student.name.first.charAt(0)}
            </div>
            <div>
              <h1 className="text-gray-900">
                {student.name.first} {student.name.last}
              </h1>
              <p className="text-gray-600">
                {student.hebrewName.first} {student.hebrewName.last}
                {student.nickname && ` (${student.nickname})`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-sm">
            {student.status}
          </Badge>
          <Button
            variant={editMode ? 'default' : 'outline'}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Save className="size-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="size-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="size-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Grade & Class</p>
                <p className="text-gray-900">{student.grade} - {student.class}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="size-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Attendance</p>
                <p className="text-gray-900">{student.attendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bus className="size-5 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Bus Route</p>
                <p className="text-gray-900">{student.bus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="size-5 text-orange-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Current Morah</p>
                <p className="text-sm text-gray-900">{student.currentMorah}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic student information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name (English)</Label>
                  <Input value={student.name.first} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name (English)</Label>
                  <Input value={student.name.last} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>First Name (Hebrew)</Label>
                  <Input value={student.hebrewName.first} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name (Hebrew)</Label>
                  <Input value={student.hebrewName.last} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Nickname</Label>
                  <Input value={student.nickname} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={student.DOB} disabled={!editMode} />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-gray-900 mb-4">Hebrew Birthday</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Input value={student.hebrewBirthDay.day} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Input value={student.hebrewBirthDay.month} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input value={student.hebrewBirthDay.year} disabled={!editMode} />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-gray-900 mb-4">Address</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input value={student.address.street} disabled={!editMode} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={student.address.city} disabled={!editMode} />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={student.address.state} disabled={!editMode} />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input value={student.address.zip} disabled={!editMode} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Neighborhood</Label>
                      <Input value={student.neighborhood} disabled={!editMode} />
                    </div>
                    <div className="space-y-2">
                      <Label>Home Phone</Label>
                      <Input value={student.homePhone} disabled={!editMode} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Information */}
        <TabsContent value="family" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Contact information for parents and guardians</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select value={student.parentsMaritalStatus} disabled={!editMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Mother Information */}
              <div>
                <h3 className="text-gray-900 mb-4">Mother</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={student.mother.name} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Input value={student.mother.occupation} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={student.mother.phone} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={student.mother.email} disabled={!editMode} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Father Information */}
              <div>
                <h3 className="text-gray-900 mb-4">Father</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={student.father.name} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Input value={student.father.occupation} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={student.father.phone} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={student.father.email} disabled={!editMode} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Siblings */}
          <Card>
            <CardHeader>
              <CardTitle>Siblings</CardTitle>
              <CardDescription>Brothers and sisters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.siblings.map((sibling, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-gray-900">
                        {sibling.firstName} {sibling.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Age {sibling.age} • {sibling.gender} • {sibling.school}
                      </p>
                    </div>
                    {editMode && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                ))}
                {editMode && (
                  <Button variant="outline" className="w-full">
                    Add Sibling
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shul Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shul & Rav</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shul Name</Label>
                  <Input value={student.shul.name} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Rav Name</Label>
                  <Input value={student.shul.ravName} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Rav Phone</Label>
                  <Input value={student.shul.ravPhone} disabled={!editMode} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Information */}
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Health conditions, allergies, and emergency contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert for allergies */}
              {student.medical.allergies.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 mb-1">Allergies Alert</p>
                    <p className="text-sm text-red-700">
                      {student.medical.allergies.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Input 
                    value={student.medical.allergies.join(', ')} 
                    disabled={!editMode}
                    placeholder="List allergies separated by commas"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medications</Label>
                  <Input 
                    value={student.medical.medications.join(', ')} 
                    disabled={!editMode}
                    placeholder="List medications"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Health Conditions</Label>
                  <Input 
                    value={student.medical.healthConditions.join(', ')} 
                    disabled={!editMode}
                    placeholder="List health conditions"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-gray-900 mb-4">Doctor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Doctor Name</Label>
                    <Input value={student.medical.doctorName} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Doctor Phone</Label>
                    <Input value={student.medical.doctorPhone} disabled={!editMode} />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-gray-900 mb-4">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance Carrier</Label>
                    <Input value={student.medical.insuranceCarrier} disabled={!editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Number</Label>
                    <Input value={student.medical.policyNumber} disabled={!editMode} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Emergency Notes</Label>
                <Textarea 
                  value={student.medical.emergencyNotes} 
                  disabled={!editMode}
                  rows={3}
                  placeholder="Important emergency information"
                />
              </div>
            </CardContent>
          </Card>

          {/* Special Needs */}
          <Card>
            <CardHeader>
              <CardTitle>Special Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={student.specialNeeds.hasSpecialNeeds}
                    disabled={!editMode}
                    className="size-4"
                  />
                  <Label>Student has special needs</Label>
                </div>
                {student.specialNeeds.hasSpecialNeeds && (
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={student.specialNeeds.description} 
                      disabled={!editMode}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Information */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>School, grade, and teacher information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Current Grade</Label>
                  <Input value={student.grade} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Input value={student.class} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Current Morah</Label>
                  <Input value={student.currentMorah} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Morah Phone</Label>
                  <Input value={student.currentMorahPhone} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Bus Route</Label>
                  <Input value={student.bus} disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Attendance Rate</Label>
                  <Input value={student.attendance} disabled={!editMode} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutors & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Tutors & Support Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.tutors.map((tutor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-gray-900">{tutor}</p>
                    </div>
                    {editMode && (
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {editMode && (
                  <Button variant="outline" className="w-full">
                    Add Tutor
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Information */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fee Amount</Label>
                  <Input value={`$${student.applicationFee.feeAmount}`} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Badge variant={student.applicationFee.paid ? 'default' : 'destructive'}>
                    {student.applicationFee.paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
                {student.applicationFee.paid && (
                  <>
                    <div className="space-y-2">
                      <Label>Payment Date</Label>
                      <Input value={student.applicationFee.paidAt} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Input value={student.applicationFee.paymentMethod} disabled />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tuition & Payments</CardTitle>
              <CardDescription>Payment history and balance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No payment records available</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Notes</CardTitle>
              <CardDescription>Important notes and communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode && (
                <div className="space-y-3">
                  <Textarea placeholder="Add a new note..." rows={3} />
                  <Button>Add Note</Button>
                </div>
              )}
              
              <div className="space-y-3">
                {student.notes.map((note, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 mb-2">{note.text}</p>
                    <p className="text-sm text-gray-600">
                      {note.author} • {note.createdAt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
