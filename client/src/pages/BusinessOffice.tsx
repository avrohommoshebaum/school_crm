import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function BusinessOffice() {
  const stats = [
    { name: 'Monthly Tuition', value: '$245,680', icon: DollarSign, color: 'bg-green-100 text-green-700' },
    { name: 'Outstanding Balance', value: '$32,450', icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
    { name: 'Active Families', value: '324', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { name: 'Donations (YTD)', value: '$89,500', icon: CreditCard, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Business Office</h1>
        <p className="text-gray-600">Manage tuition, donations, and financial matters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} size-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="size-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payments and donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No recent transactions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Reminders</CardTitle>
            <CardDescription>Families with outstanding balances</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No pending reminders.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
