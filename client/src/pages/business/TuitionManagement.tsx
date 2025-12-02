import { useState } from 'react';
import { Search, Plus, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function TuitionManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const families = [
    {
      id: 1,
      name: 'Cohen Family',
      students: ['Sarah Cohen - 3rd Grade', 'Leah Cohen - 1st Grade'],
      monthlyTuition: 1200,
      balance: 0,
      lastPayment: '2024-11-01',
      paymentMethod: 'Auto-Pay - Credit Card',
      status: 'current',
      yearlyPaid: 13200,
      yearlyTotal: 14400
    },
    {
      id: 2,
      name: 'Goldstein Family',
      students: ['Rivka Goldstein - 3rd Grade'],
      monthlyTuition: 650,
      balance: -1300,
      lastPayment: '2024-10-15',
      paymentMethod: 'Manual - Check',
      status: 'past-due',
      yearlyPaid: 5200,
      yearlyTotal: 7800
    },
    {
      id: 3,
      name: 'Schwartz Family',
      students: ['Leah Schwartz - 4th Grade', 'Yakov Schwartz - Pre-K'],
      monthlyTuition: 1350,
      balance: 0,
      lastPayment: '2024-11-01',
      paymentMethod: 'Auto-Pay - Bank Transfer',
      status: 'current',
      yearlyPaid: 14850,
      yearlyTotal: 16200
    },
    {
      id: 4,
      name: 'Levy Family',
      students: ['Miriam Levy - 2nd Grade'],
      monthlyTuition: 650,
      balance: -650,
      lastPayment: '2024-09-30',
      paymentMethod: 'Manual - Cash',
      status: 'past-due',
      yearlyPaid: 5850,
      yearlyTotal: 7800
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800">Current</Badge>;
      case 'past-due':
        return <Badge className="bg-red-100 text-red-800">Past Due</Badge>;
      case 'payment-plan':
        return <Badge className="bg-blue-100 text-blue-800">Payment Plan</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const filteredFamilies = families.filter(family =>
    family.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentFamilies = filteredFamilies.filter(f => f.status === 'current');
  const pastDueFamilies = filteredFamilies.filter(f => f.status === 'past-due');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Tuition Management</h2>
          <p className="text-sm text-gray-600">Track tuition payments and manage family accounts</p>
        </div>
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-700 hover:bg-green-800">
              <Plus className="size-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Tuition Payment</DialogTitle>
              <DialogDescription>Record a tuition payment received from a family</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Family *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select family" />
                  </SelectTrigger>
                  <SelectContent>
                    {families.map(family => (
                      <SelectItem key={family.id} value={family.id.toString()}>
                        {family.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Amount *</Label>
                  <Input type="number" placeholder="0.00" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Date *</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="auto-pay">Auto-Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input placeholder="Check number, transaction ID, etc." />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Additional notes about this payment" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-green-700 hover:bg-green-800">
                  Record Payment
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsPaymentDialogOpen(false)}>
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
                <p className="text-sm text-gray-600 mb-1">Total Families</p>
                <p className="text-gray-900">{families.length}</p>
              </div>
              <DollarSign className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current</p>
                <p className="text-gray-900">{currentFamilies.length}</p>
              </div>
              <CheckCircle className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Past Due</p>
                <p className="text-gray-900">{pastDueFamilies.length}</p>
              </div>
              <AlertCircle className="size-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                <p className="text-gray-900">$32,450</p>
              </div>
              <Clock className="size-8 text-orange-600" />
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
              placeholder="Search families..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Families Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Families ({filteredFamilies.length})</TabsTrigger>
          <TabsTrigger value="current">Current ({currentFamilies.length})</TabsTrigger>
          <TabsTrigger value="past-due">Past Due ({pastDueFamilies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredFamilies.map((family) => (
            <Card key={family.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{family.name}</h3>
                      {getStatusBadge(family.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {family.students.map((student, idx) => (
                        <p key={idx}>• {student}</p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Balance</p>
                    <p className={`text-xl ${family.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {family.balance < 0 ? `-$${Math.abs(family.balance)}` : `$${family.balance}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Monthly Tuition</p>
                    <p className="text-sm text-gray-900">${family.monthlyTuition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Last Payment</p>
                    <p className="text-sm text-gray-900">{family.lastPayment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm text-gray-900">{family.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Yearly Progress</p>
                    <p className="text-sm text-gray-900">${family.yearlyPaid} / ${family.yearlyTotal}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Payment History
                  </Button>
                  <Button variant="outline" size="sm">
                    Send Reminder
                  </Button>
                  {family.status === 'past-due' && (
                    <Button variant="outline" size="sm" className="ml-auto text-red-700 border-red-300">
                      Contact Family
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="current">
          <div className="space-y-4">
            {currentFamilies.map((family) => (
              <Card key={family.id}>
                <CardContent className="p-6">
                  <p className="text-gray-900">{family.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past-due">
          <div className="space-y-4">
            {pastDueFamilies.map((family) => (
              <Card key={family.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <p className="text-gray-900">{family.name} - Outstanding: ${Math.abs(family.balance)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
