'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Clock,
  Search,
  BookOpen,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Target,
  Zap,
  Eye,
  Share2,
  Award
} from 'lucide-react';
import { analyticsEngine, AnalyticsInsight, ResourceAnalytics } from '@/lib/analytics-engine';

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const [resourceAnalytics, setResourceAnalytics] = useState<ResourceAnalytics[]>([]);
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Generate fresh insights
    const freshInsights = analyticsEngine.generateInsights();
    setInsights(freshInsights);
    
    // Get user metrics
    const metrics = analyticsEngine.getUserMetrics();
    setUserMetrics(metrics);
    
    // Get resource analytics
    const resAnalytics = analyticsEngine.getResourceAnalytics();
    setResourceAnalytics(resAnalytics);
    
    setLoading(false);
  };

  const exportAnalytics = () => {
    const data = analyticsEngine.exportAnalytics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Sessions',
      value: userMetrics?.totalSessions || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Avg Session Duration',
      value: `${userMetrics?.avgSessionDuration || 0}m`,
      change: '+5%',
      trend: 'up',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      title: 'Resources Explored',
      value: userMetrics?.uniqueResourcesExplored || 0,
      change: '+8%',
      trend: 'up',
      icon: BookOpen,
      color: 'bg-purple-500'
    },
    {
      title: 'Quiz Accuracy',
      value: `${userMetrics?.quizAccuracy || 0}%`,
      change: '+15%',
      trend: 'up',
      icon: Target,
      color: 'bg-orange-500'
    },
    {
      title: 'Total Interactions',
      value: userMetrics?.totalInteractions || 0,
      change: '+22%',
      trend: 'up',
      icon: Zap,
      color: 'bg-pink-500'
    },
    {
      title: 'Learning Time',
      value: `${userMetrics?.totalDuration || 0}m`,
      change: '+18%',
      trend: 'up',
      icon: Award,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Explorer
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
                <p className="text-gray-600 mt-1">Insights into learning patterns and platform usage</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportAnalytics}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading analytics data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {metricCards.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                          <metric.icon className={`h-6 w-6 ${metric.color.replace('bg-', 'text-')}`} />
                        </div>
                      </div>
                      {metric.trend && (
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-sm font-medium ${
                            metric.trend === 'up' ? 'text-green-600' : 
                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {metric.change}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI-Generated Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights.map((insight) => (
                  <div key={insight.id} className={`bg-white rounded-lg shadow border-l-4 ${getImportanceColor(insight.importance)}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                            {getTrendIcon(insight.trend)}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              insight.importance === 'high' ? 'bg-red-100 text-red-800' :
                              insight.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {insight.importance}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="text-2xl font-bold text-gray-900">
                              {insight.value}
                              {insight.metadata?.unit && (
                                <span className="text-sm font-normal text-gray-500 ml-1">
                                  {insight.metadata.unit}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{insight.timeframe}</span>
                          </div>
                          {insight.recommendation && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Recommendation:</strong> {insight.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Analytics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resource Performance</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unique Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Time Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resourceAnalytics.slice(0, 10).map((resource, index) => (
                        <tr key={resource.resourceType} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {resource.resourceType.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {resource.resourceType}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Rank #{index + 1}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{resource.totalViews}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{resource.uniqueViews}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {Math.round(resource.avgTimeSpent / 60)}m
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${resource.completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{resource.completionRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg key={star} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-900 ml-2">
                                {resource.userRatings.length > 0 ? 
                                  (resource.userRatings.reduce((a, b) => a + b, 0) / resource.userRatings.length).toFixed(1) : 
                                  'N/A'
                                }
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Usage Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Device Usage */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Monitor className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tablet className="h-5 w-5 text-purple-500 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Tablet</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Progress */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Modules Completed</span>
                    <span className="text-sm text-gray-600">8/12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-gray-700">Quiz Performance</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-gray-700">Resource Coverage</span>
                    <span className="text-sm text-gray-600">12/26</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '46%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <BookOpen className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Completed Patient Resource Tutorial</span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <Target className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Scored 90% on FHIR Basics Quiz</span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">5 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                            <Share2 className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Shared Observation example to community</span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}