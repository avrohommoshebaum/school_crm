import { useState } from 'react';
import { Heart, Plus, Search, TrendingUp, CreditCard, Building2, Wallet, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function Donations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [donationType, setDonationType] = useState('credit-card');
  const [copied, setCopied] = useState(false);

  const donations = [
    {
      id: 1,
      donor: 'Anonymous',
      amount: 5000,
      date: '2024-11-24',
      purpose: 'General Fund',
      method: 'Check',
      taxDeductible: true,
      receiptSent: true
    },
    {
      id: 2,
      donor: 'Moshe & Rivka Cohen',
      amount: 1800,
      date: '2024-11-20',
      purpose: 'Scholarship Fund',
      method: 'Credit Card',
      taxDeductible: true,
      receiptSent: true
    },
    {
      id: 3,
      donor: 'Goldstein Family',
      amount: 500,
      date: '2024-11-15',
      purpose: 'Building Fund',
      method: 'Donors Fund',
      taxDeductible: true,
      receiptSent: false
    },
    {
      id: 4,
      donor: 'Klein Family Foundation',
      amount: 10000,
      date: '2024-11-10',
      purpose: 'Scholarship Fund',
      method: 'Wire Transfer',
      taxDeductible: true,
      receiptSent: true
    },
  ];

  const filteredDonations = donations.filter(donation =>
    donation.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const thisMonth = donations.filter(d => new Date(d.date).getMonth() === new Date().getMonth()).length;

  const handleCopyWireInfo = () => {
    const wireInfo = `Bank Name: Chase Bank
Account Name: Nachlas Bais Yaakov
Account Number: 1234567890
Routing Number: 021000021
Swift Code: CHASUS33
Bank Address: 123 Main Street, New York, NY 10001`;
    
    navigator.clipboard.writeText(wireInfo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy wire info:', err);
      // Fallback: Still show feedback even if copy failed
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Donations</h2>
          <p className="text-sm text-gray-600">Track and manage charitable donations</p>
        </div>
        <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="size-4 mr-2" />
              New Donation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Process Donation</DialogTitle>
              <DialogDescription>Accept donations via credit card, wire transfer, or Donors Fund</DialogDescription>
            </DialogHeader>
            
            <Tabs value={donationType} onValueChange={setDonationType} className="pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="credit-card" className="flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Credit Card
                </TabsTrigger>
                <TabsTrigger value="wire" className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  Wire Transfer
                </TabsTrigger>
                <TabsTrigger value="donors-fund" className="flex items-center gap-2">
                  <Wallet className="size-4" />
                  Donors Fund
                </TabsTrigger>
              </TabsList>

              {/* Credit Card Tab */}
              <TabsContent value="credit-card" className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription>
                    Process credit card donations securely through your payment processor.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Donor Name *</Label>
                    <Input placeholder="Enter donor name" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Donation Amount *</Label>
                      <Input type="number" placeholder="0.00" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose/Fund *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fund" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Fund</SelectItem>
                          <SelectItem value="scholarship">Scholarship Fund</SelectItem>
                          <SelectItem value="building">Building Fund</SelectItem>
                          <SelectItem value="technology">Technology Fund</SelectItem>
                          <SelectItem value="library">Library Fund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Card Number *</Label>
                    <Input placeholder="4242 4242 4242 4242" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Expiration Date *</Label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV *</Label>
                      <Input placeholder="123" maxLength={4} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Billing Zip Code *</Label>
                    <Input placeholder="12345" />
                  </div>

                  <div className="space-y-2">
                    <Label>Donor Email (for receipt)</Label>
                    <Input type="email" placeholder="donor@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Any special instructions or dedications" rows={2} />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="recurring" className="size-4" />
                    <Label htmlFor="recurring">Make this a recurring monthly donation</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <CreditCard className="size-4 mr-2" />
                    Process Payment
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDonationDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              {/* Wire Transfer Tab */}
              <TabsContent value="wire" className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription>
                    For wire transfers, provide donors with your bank information and log the donation once received.
                  </AlertDescription>
                </Alert>

                <Card className="bg-gray-50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-gray-900">Wire Transfer Information</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyWireInfo}
                        className="gap-2"
                      >
                        {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
                        {copied ? 'Copied!' : 'Copy All'}
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Bank Name:</p>
                        <p className="text-gray-900">Chase Bank</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Account Name:</p>
                        <p className="text-gray-900">Nachlas Bais Yaakov</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Account Number:</p>
                        <p className="text-gray-900">1234567890</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Routing Number:</p>
                        <p className="text-gray-900">021000021</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Swift Code:</p>
                        <p className="text-gray-900">CHASUS33</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Bank Address:</p>
                        <p className="text-gray-900">123 Main Street, New York, NY 10001</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Donor Name *</Label>
                    <Input placeholder="Enter donor name" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Donation Amount *</Label>
                      <Input type="number" placeholder="0.00" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date Received *</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Purpose/Fund *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Fund</SelectItem>
                        <SelectItem value="scholarship">Scholarship Fund</SelectItem>
                        <SelectItem value="building">Building Fund</SelectItem>
                        <SelectItem value="technology">Technology Fund</SelectItem>
                        <SelectItem value="library">Library Fund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Wire Reference Number</Label>
                    <Input placeholder="Enter bank reference number" />
                  </div>

                  <div className="space-y-2">
                    <Label>Donor Contact (for receipt)</Label>
                    <Input placeholder="Email or phone" />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Any additional information" rows={2} />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Heart className="size-4 mr-2" />
                    Log Wire Transfer
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDonationDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              {/* Donors Fund Tab */}
              <TabsContent value="donors-fund" className="space-y-4">
                <Alert className="bg-purple-50 border-purple-200">
                  <AlertDescription className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="mb-2">Accept donations from donor-advised funds through The Donors Fund platform.</p>
                      <a 
                        href="https://thedonorsfund.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-700 hover:text-purple-800 text-sm inline-flex items-center gap-1"
                      >
                        Learn more about Donors Fund
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </AlertDescription>
                </Alert>

                <Card className="bg-gray-50">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-gray-900">Nachlas Bais Yaakov - Donors Fund Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Organization Name:</p>
                        <p className="text-gray-900">Nachlas Bais Yaakov</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">EIN:</p>
                        <p className="text-gray-900">XX-XXXXXXX</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-600">Address:</p>
                        <p className="text-gray-900">213 Newport Ave, Lakewood NJ 08701</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Donor Name *</Label>
                    <Input placeholder="Name of donor or fund" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expected Amount *</Label>
                      <Input type="number" placeholder="0.00" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose/Fund *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fund" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Fund</SelectItem>
                          <SelectItem value="scholarship">Scholarship Fund</SelectItem>
                          <SelectItem value="building">Building Fund</SelectItem>
                          <SelectItem value="technology">Technology Fund</SelectItem>
                          <SelectItem value="library">Library Fund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Donors Fund Account ID</Label>
                    <Input placeholder="Enter Donors Fund account or reference ID" />
                  </div>

                  <div className="space-y-2">
                    <Label>Grant Request Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requested">Grant Requested</SelectItem>
                        <SelectItem value="pending">Pending Approval</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="received">Funds Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Requested/Received</Label>
                    <Input type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label>Donor Contact Information</Label>
                    <Input placeholder="Email or phone" />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Special instructions, dedication, or grant details" rows={2} />
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-sm">
                    <strong>API Integration Available:</strong> Connect your Donors Fund account to automatically sync grant requests and donations. Contact your administrator to set up API credentials.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Wallet className="size-4 mr-2" />
                    Log Donors Fund Donation
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDonationDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total (YTD)</p>
                <p className="text-gray-900">${totalDonations.toLocaleString()}</p>
              </div>
              <Heart className="size-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-gray-900">{thisMonth} donations</p>
              </div>
              <TrendingUp className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Credit Card</p>
                <p className="text-gray-900">${(1800).toLocaleString()}</p>
              </div>
              <CreditCard className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Donors Fund</p>
                <p className="text-gray-900">${(10500).toLocaleString()}</p>
              </div>
              <Wallet className="size-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Methods Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="size-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-gray-900 mb-1">Credit Card</h3>
                <p className="text-sm text-gray-600">Instant processing with secure payment gateway</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Building2 className="size-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-gray-900 mb-1">Wire Transfer</h3>
                <p className="text-sm text-gray-600">Bank-to-bank transfers for large donations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Wallet className="size-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-gray-900 mb-1">Donors Fund</h3>
                <p className="text-sm text-gray-600">Donor-advised fund grants and securities</p>
              </div>
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
              placeholder="Search donations by donor or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Donations List */}
      <div className="space-y-4">
        {filteredDonations.map((donation) => (
          <Card key={donation.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="size-5 text-purple-600" />
                    <h3 className="text-gray-900">{donation.donor}</h3>
                    {donation.method === 'Credit Card' && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <CreditCard className="size-3 mr-1" />
                        Credit Card
                      </Badge>
                    )}
                    {donation.method === 'Wire Transfer' && (
                      <Badge className="bg-green-100 text-green-800">
                        <Building2 className="size-3 mr-1" />
                        Wire Transfer
                      </Badge>
                    )}
                    {donation.method === 'Donors Fund' && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Wallet className="size-3 mr-1" />
                        Donors Fund
                      </Badge>
                    )}
                    {donation.receiptSent ? (
                      <Badge className="bg-green-100 text-green-800">Receipt Sent</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">Receipt Pending</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-gray-900">${donation.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Purpose</p>
                      <p className="text-gray-900">{donation.purpose}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-gray-900">{donation.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Method</p>
                      <p className="text-gray-900">{donation.method}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {!donation.receiptSent && (
                    <Button variant="outline" size="sm">
                      Send Receipt
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
