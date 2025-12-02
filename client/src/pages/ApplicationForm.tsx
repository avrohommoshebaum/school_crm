import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const steps = [
    { number: 1, title: 'Student Info' },
    { number: 2, title: 'Family Info' },
    { number: 3, title: 'Medical Info' },
    { number: 4, title: 'References' },
    { number: 5, title: 'Review & Submit' },
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/applications')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-gray-900">New Student Application</h1>
          <p className="text-gray-600">Nachlas Bais Yaakov - School Year 2024-2025</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="size-5" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 hidden sm:block ${
                      currentStep === step.number ? 'text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Student Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name (English) *</Label>
                  <Input placeholder="Enter first name" required />
                </div>
                <div className="space-y-2">
                  <Label>Last Name (English) *</Label>
                  <Input placeholder="Enter last name" required />
                </div>
                <div className="space-y-2">
                  <Label>First Name (Hebrew)</Label>
                  <Input placeholder="שם פרטי" dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name (Hebrew)</Label>
                  <Input placeholder="שם משפחה" dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>Nickname</Label>
                  <Input placeholder="Preferred name" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input type="date" required />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Enrollment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Applying for Grade *</Label>
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
                    <Label>Current School</Label>
                    <Input placeholder="Current school name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Morah/Teacher</Label>
                    <Input placeholder="Teacher name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teacher Phone</Label>
                    <Input type="tel" placeholder="(732) 555-0000" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Family Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-gray-900">Address</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address *</Label>
                    <Input placeholder="123 Main Street" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input placeholder="Lakewood" required />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Input placeholder="NJ" required />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code *</Label>
                      <Input placeholder="08701" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Neighborhood</Label>
                      <Input placeholder="Neighborhood name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Home Phone *</Label>
                      <Input type="tel" placeholder="(732) 555-0000" required />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Mother Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input placeholder="Mother's full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Cell Phone *</Label>
                    <Input type="tel" placeholder="(732) 555-0000" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="email@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Input placeholder="Occupation" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Father Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input placeholder="Father's full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Cell Phone *</Label>
                    <Input type="tel" placeholder="(732) 555-0000" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="email@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Input placeholder="Occupation" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Parental Marital Status *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Medical Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-gray-900">Health Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Allergies</Label>
                    <Input placeholder="List any allergies (comma separated)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Medications</Label>
                    <Input placeholder="List any regular medications" />
                  </div>
                  <div className="space-y-2">
                    <Label>Health Conditions</Label>
                    <Textarea placeholder="Describe any health conditions" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Medical Notes</Label>
                    <Textarea placeholder="Important information for emergencies" rows={3} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Doctor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Doctor Name</Label>
                    <Input placeholder="Dr. Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Doctor Phone</Label>
                    <Input type="tel" placeholder="(732) 555-0000" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance Carrier</Label>
                    <Input placeholder="Insurance company name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Number</Label>
                    <Input placeholder="Policy number" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="specialNeeds" />
                  <Label htmlFor="specialNeeds">Student has special needs requiring accommodation</Label>
                </div>
                <div className="space-y-2">
                  <Label>Special Needs Description (if applicable)</Label>
                  <Textarea placeholder="Please describe any special needs or accommodations required" rows={4} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: References */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-gray-900">Shul & Rav Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shul Name *</Label>
                    <Input placeholder="Shul name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Shul Affiliation</Label>
                    <Input placeholder="Affiliation" />
                  </div>
                  <div className="space-y-2">
                    <Label>Rav Name</Label>
                    <Input placeholder="Rav's name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Rav Phone</Label>
                    <Input type="tel" placeholder="(732) 555-0000" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Family References</h3>
                <p className="text-sm text-gray-600">Please provide two family references</p>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="text-sm text-gray-900">Reference 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="Reference name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input type="tel" placeholder="(732) 555-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input placeholder="e.g., Family friend, Relative" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="text-sm text-gray-900">Reference 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="Reference name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input type="tel" placeholder="(732) 555-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input placeholder="e.g., Family friend, Relative" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Families You Know at Nachlas Bais Yaakov</Label>
                <Textarea placeholder="List any families you know at the school" rows={3} />
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-blue-900 mb-2">Application Fee</h3>
                <p className="text-gray-700 mb-4">
                  A non-refundable application fee of <span className="font-semibold">$175</span> is required to process your application.
                </p>
                <div className="flex items-center gap-2">
                  <Checkbox id="feeAgreement" />
                  <Label htmlFor="feeAgreement">
                    I understand and agree to pay the $175 application fee
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Signature & Agreement</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Parent/Guardian Signature *</Label>
                    <Input placeholder="Type your full name as signature" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Today's Date</Label>
                    <Input type="date" value={new Date().toISOString().split('T')[0]} disabled />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox id="accuracy" />
                  <Label htmlFor="accuracy" className="text-sm leading-relaxed">
                    I certify that all information provided in this application is true and accurate to the best of my knowledge
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="policies" />
                  <Label htmlFor="policies" className="text-sm leading-relaxed">
                    I have read and agree to abide by the school's policies and procedures
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="consent" />
                  <Label htmlFor="consent" className="text-sm leading-relaxed">
                    I consent to Nachlas Bais Yaakov contacting the references and schools listed in this application
                  </Label>
                </div>
              </div>

              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-green-900 mb-2">Ready to Submit</h4>
                <p className="text-sm text-green-700">
                  Please review all information before submitting. You will receive a confirmation email once your application is received.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="bg-blue-700 hover:bg-blue-800">
                Next Step
              </Button>
            ) : (
              <Button className="bg-green-700 hover:bg-green-800">
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
