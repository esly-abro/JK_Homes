import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Phone, Mail, FileText, Calendar as CalendarIcon, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTasks, updateTask } from '../../services/leads';

export default function Activities() {
  const { activities, leads, siteVisits } = useData();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await getTasks({ status: 'pending' });
      setTasks(response);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { isCompleted: true });
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Combine activities and site visits for feed
  const allActivities = [
    ...activities.map(a => ({
      ...a,
      id: a.id || a._id,
      description: a.description || a.title,
      user: a.user || a.userName || 'System'
    })),
    ...siteVisits.map(visit => ({
      id: visit._id,
      type: 'site_visit',
      leadId: visit.lead?._id || visit.lead?.id,
      description: `Site visit scheduled with ${visit.lead?.name || 'client'} on ${new Date(visit.scheduledAt).toLocaleDateString()} at ${new Date(visit.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      timestamp: visit.createdAt || visit.scheduledAt,
      user: visit.confirmedBy || 'System'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'note': return FileText;
      case 'meeting': return CalendarIcon;
      case 'whatsapp': return MessageSquare;
      case 'site_visit': return MapPin;
      default: return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-green-100 text-green-600';
      case 'email': return 'bg-blue-100 text-blue-600';
      case 'site_visit': return 'bg-purple-100 text-purple-600';
      case 'meeting': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">Track all your interactions and tasks</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {allActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No activities yet</p>
                    <p className="text-sm">Schedule a site visit or add an activity to get started</p>
                  </div>
                ) : (
                  allActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);
                    const lead = leads.find(l => l.id === activity.leadId || (l as any)._id === activity.leadId);
                    return (
                      <div key={activity.id} className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={activity.type === 'site_visit' ? 'bg-purple-600' : ''}>{activity.type.toUpperCase().replace('_', ' ')}</Badge>
                            {lead && <span className="font-semibold">{lead.name}</span>}
                          </div>
                          <p className="text-gray-700">{activity.description}</p>
                          <div className="text-sm text-gray-500 mt-1">
                            {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks & Reminders */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks & Reminders</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">Overdue</h3>
                  {loadingTasks ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : tasks.filter(t => new Date(t.scheduledAt) < new Date() && !t.isCompleted).length === 0 ? (
                    <div className="text-sm text-gray-500">No overdue tasks</div>
                  ) : (
                    tasks.filter(t => new Date(t.scheduledAt) < new Date() && !t.isCompleted).map(task => (
                      <div key={task._id} className="p-3 border rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <input 
                            type="checkbox" 
                            className="rounded cursor-pointer" 
                            onChange={() => handleCompleteTask(task._id)}
                          />
                          <span className="font-medium text-sm">{task.title}</span>
                        </div>
                        {task.metadata?.priority && (
                          <Badge className={
                            task.metadata.priority === 'high' ? 'bg-red-100 text-red-600' :
                            task.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }>
                            {task.metadata.priority}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Today's Tasks</h3>
                  {loadingTasks ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : tasks.filter(t => {
                    const taskDate = new Date(t.scheduledAt).toDateString();
                    const today = new Date().toDateString();
                    return taskDate === today && !t.isCompleted;
                  }).length === 0 ? (
                    <div className="text-sm text-gray-500">No tasks for today</div>
                  ) : (
                    tasks.filter(t => {
                      const taskDate = new Date(t.scheduledAt).toDateString();
                      const today = new Date().toDateString();
                      return taskDate === today && !t.isCompleted;
                    }).map(task => (
                      <div key={task._id} className="p-3 border rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <input 
                            type="checkbox" 
                            className="rounded cursor-pointer" 
                            onChange={() => handleCompleteTask(task._id)}
                          />
                          <span className="font-medium text-sm">{task.title}</span>
                        </div>
                        {task.metadata?.priority && (
                          <Badge className={
                            task.metadata.priority === 'high' ? 'bg-red-100 text-red-600' :
                            task.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }>
                            {task.metadata.priority}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Upcoming</h3>
                  {loadingTasks ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : tasks.filter(t => {
                    const taskDate = new Date(t.scheduledAt);
                    const today = new Date();
                    return taskDate > today && !t.isCompleted;
                  }).length === 0 ? (
                    <div className="text-sm text-gray-500">No upcoming tasks</div>
                  ) : (
                    tasks.filter(t => {
                      const taskDate = new Date(t.scheduledAt);
                      const today = new Date();
                      return taskDate > today && !t.isCompleted;
                    }).map(task => (
                      <div key={task._id} className="p-3 border rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <input 
                            type="checkbox" 
                            className="rounded cursor-pointer" 
                            onChange={() => handleCompleteTask(task._id)}
                          />
                          <span className="font-medium text-sm">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{new Date(task.scheduledAt).toLocaleDateString()}</span>
                          {task.metadata?.priority && (
                            <Badge variant="outline" className="text-xs">{task.metadata.priority}</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
