import { Bus, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export default function Transportation() {
  const routes = [
    {
      id: 1,
      name: 'Route 1 - Westgate',
      students: 18,
      driver: 'Mr. Levi',
      monthlyFee: 210,
      collectedThisMonth: 3780,
      totalExpected: 3780,
      stops: ['Main St & Oak', 'Maple Ave', 'School']
    },
    {
      id: 2,
      name: 'Route 2 - Downtown',
      students: 22,
      driver: 'Mr. Cohen',
      monthlyFee: 210,
      collectedThisMonth: 4200,
      totalExpected: 4620,
      stops: ['Central Square', 'Park Ave', 'School']
    },
    {
      id: 3,
      name: 'Route 3 - North Side',
      students: 15,
      driver: 'Mrs. Goldstein',
      monthlyFee: 210,
      collectedThisMonth: 3150,
      totalExpected: 3150,
      stops: ['Highland Rd', 'Brook St', 'School']
    },
  ];

  const totalStudents = routes.reduce((sum, r) => sum + r.students, 0);
  const totalCollected = routes.reduce((sum, r) => sum + r.collectedThisMonth, 0);
  const totalExpected = routes.reduce((sum, r) => sum + r.totalExpected, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Transportation Management</h2>
          <p className="text-sm text-gray-600">Manage bus routes and transportation fees</p>
        </div>
        <Button className="bg-blue-700 hover:bg-blue-800">
          <Bus className="size-4 mr-2" />
          Add Route
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Routes</p>
                <p className="text-gray-900">{routes.length}</p>
              </div>
              <Bus className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Students on Buses</p>
                <p className="text-gray-900">{totalStudents}</p>
              </div>
              <Users className="size-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Collected (Month)</p>
                <p className="text-gray-900">${totalCollected}</p>
              </div>
              <Bus className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                <p className="text-gray-900">${totalExpected - totalCollected}</p>
              </div>
              <Bus className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes */}
      <div className="space-y-4">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Bus className="size-6 text-blue-600" />
                    <h3 className="text-gray-900">{route.name}</h3>
                    <Badge variant="outline">{route.students} students</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Driver: {route.driver}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-4 text-gray-400" />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {route.stops.map((stop, idx) => (
                        <span key={idx}>
                          {stop}
                          {idx < route.stops.length - 1 && <span className="mx-2">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Monthly Fee</p>
                      <p className="text-sm text-gray-900">${route.monthlyFee}/student</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Collected This Month</p>
                      <p className="text-sm text-gray-900">${route.collectedThisMonth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Collection Rate</p>
                      <p className={`text-sm ${route.collectedThisMonth >= route.totalExpected ? 'text-green-600' : 'text-orange-600'}`}>
                        {Math.round((route.collectedThisMonth / route.totalExpected) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Students
                </Button>
                <Button variant="outline" size="sm">
                  Edit Route
                </Button>
                <Button variant="outline" size="sm">
                  Payment Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
