import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const { leads, activities } = useData();
  const [dateRange, setDateRange] = useState('30days');

  // Calculate real monthly data from leads
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, idx) => {
      const monthLeads = leads.filter(l => {
        const created = new Date(l.createdAt);
        return created.getMonth() === idx;
      });
      const monthDeals = monthLeads.filter(l => ['Deal Closed', 'Interested', 'Site Visit Completed'].includes(l.status));
      const revenue = monthDeals.reduce((sum, l) => sum + (l.value || 0), 0);
      
      return {
        month,
        leads: monthLeads.length,
        deals: monthDeals.length,
        revenue
      };
    });
  }, [leads]);

  // Calculate conversion funnel from real data
  const conversionFunnel = useMemo(() => [
    { stage: 'Leads', count: leads.length },
    { stage: 'Contacted', count: leads.filter(l => !['New'].includes(l.status)).length },
    { stage: 'Qualified', count: leads.filter(l => ['Follow-up Completed', 'Site Visit Scheduled', 'Site Visit Completed', 'Interested', 'Negotiation', 'Deal Closed'].includes(l.status)).length },
    { stage: 'Proposal', count: leads.filter(l => ['Negotiation', 'Deal Closed'].includes(l.status)).length },
    { stage: 'Closed', count: leads.filter(l => l.status === 'Deal Closed').length },
  ], [leads]);

  // Calculate source performance
  const sourcePerformance = useMemo(() => {
    const sources = [...new Set(leads.map(l => l.source))];
    return sources.map(source => {
      const sourceLeads = leads.filter(l => l.source === source);
      const converted = sourceLeads.filter(l => ['Deal Closed', 'Interested'].includes(l.status));
      return {
        source,
        leads: sourceLeads.length,
        conversion: sourceLeads.length > 0 ? Math.round((converted.length / sourceLeads.length) * 100) : 0
      };
    }).sort((a, b) => b.leads - a.leads);
  }, [leads]);

  // Calculate team performance from real leads
  const teamData = useMemo(() => {
    const teamMap = new Map();
    
    leads.forEach(lead => {
      const ownerName = typeof lead.owner === 'string' ? lead.owner : lead.owner?.name || 'Unassigned';
      
      if (!teamMap.has(ownerName)) {
        teamMap.set(ownerName, { name: ownerName, leads: 0, deals: 0, revenue: 0 });
      }
      
      const member = teamMap.get(ownerName);
      member.leads += 1;
      
      if (['Deal Closed', 'Interested', 'Site Visit Completed'].includes(lead.status)) {
        member.deals += 1;
        member.revenue += lead.value || 0;
      }
    });
    
    return Array.from(teamMap.values()).sort((a, b) => b.leads - a.leads).slice(0, 10);
  }, [leads]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Calculate KPIs from real data
  const totalLeads = leads.length;
  const closedDeals = leads.filter(l => l.status === 'Deal Closed').length;
  const conversionRate = totalLeads > 0 ? ((closedDeals / totalLeads) * 100).toFixed(1) : '0.0';
  const totalRevenue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your performance and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">This year</option>
          </select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <h3 className="text-2xl font-bold">{totalLeads}</h3>
                    <p className="text-sm text-gray-600">All time</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <h3 className="text-2xl font-bold">{conversionRate}%</h3>
                    <p className="text-sm text-gray-600">Closed deals</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Deals Closed</p>
                    <h3 className="text-2xl font-bold">{closedDeals}</h3>
                    <p className="text-sm text-gray-600">Total closed</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <h3 className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</h3>
                    <p className="text-sm text-gray-600">Pipeline value</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="deals" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Source Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourcePerformance.map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{source.source}</div>
                      <div className="text-sm text-gray-600">{source.leads} leads</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{source.conversion}%</div>
                      <div className="text-sm text-gray-600">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Team Member</th>
                      <th className="text-right p-4">Leads</th>
                      <th className="text-right p-4">Deals</th>
                      <th className="text-right p-4">Revenue</th>
                      <th className="text-right p-4">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.map((member) => (
                      <tr key={member.name} className="border-b">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-semibold">{member.name}</span>
                          </div>
                        </td>
                        <td className="text-right p-4">{member.leads}</td>
                        <td className="text-right p-4">{member.deals}</td>
                        <td className="text-right p-4">${(member.revenue / 1000).toFixed(0)}K</td>
                        <td className="text-right p-4">{((member.deals / member.leads) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
