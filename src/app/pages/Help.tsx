import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, BookOpen, MessageSquare, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Help() {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: <BookOpen className="h-6 w-6" />,
      articles: [
        'How to add your first lead',
        'Understanding the dashboard',
        'Setting up your profile',
        'Inviting team members'
      ]
    },
    {
      title: 'Lead Management',
      icon: <MessageSquare className="h-6 w-6" />,
      articles: [
        'How to assign leads',
        'Tracking lead activities',
        'Managing lead status',
        'Importing leads from CSV'
      ]
    },
    {
      title: 'Properties',
      icon: <BookOpen className="h-6 w-6" />,
      articles: [
        'Adding property listings',
        'Managing property details',
        'Assigning properties to leads',
        'Property search and filters'
      ]
    },
    {
      title: 'Communication',
      icon: <Phone className="h-6 w-6" />,
      articles: [
        'Making calls with Exotel',
        'Sending messages',
        'Scheduling site visits',
        'Email notifications'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-600">Find answers and get support</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search help articles..."
              className="pl-10 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-gray-600">Comprehensive guides and tutorials</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-gray-600">Chat with our support team</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Call Support</h3>
              <p className="text-sm text-gray-600">Speak with a support agent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Opening article: ${article}`);
                      }}
                    >
                      {article}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Schedule a Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
