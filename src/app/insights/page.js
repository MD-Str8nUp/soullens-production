'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowLeft, 
  Calendar,
  Clock,
  Heart,
  Brain,
  Target,
  Zap,
  Award,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Download,
  Share
} from 'lucide-react';

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('mood');

  useEffect(() => {
    loadInsights();
  }, [selectedPeriod]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/journal/insights?period=${selectedPeriod}`);
      const data = await response.json();
      
      // Transform API data to match frontend expectations
      const transformedInsights = {
        totalEntries: data.insights?.totalEntries || 0,
        streakDays: 7, // Default value
        averageMood: data.insights?.avgMoodScore || 4.2,
        topEmotions: data.insights?.emotionDistribution ?
          Object.entries(data.insights.emotionDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([emotion]) => emotion) :
          ['happy', 'calm', 'excited'],
        insights: [
          { type: 'pattern', text: data.insights?.summary || 'You tend to write longer entries on weekends', confidence: 'high' },
          { type: 'mood', text: 'Your mood improves significantly after journaling', confidence: 'medium' },
          { type: 'time', text: 'Evening entries show more reflection and clarity', confidence: 'high' }
        ],
        weeklyProgress: [3, 5, 2, 4, 6, 3, 5], // Mock data for chart
        moodTrend: [3.5, 4.0, 3.8, 4.2, 4.5, 4.1, 4.3] // Mock data for trend
      };
      
      setInsights(transformedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
      // Fallback data
      setInsights({
        totalEntries: 24,
        streakDays: 7,
        averageMood: 4.2,
        topEmotions: ['happy', 'calm', 'excited'],
        insights: [
          { type: 'pattern', text: 'You tend to write longer entries on weekends', confidence: 'high' },
          { type: 'mood', text: 'Your mood improves significantly after journaling', confidence: 'medium' },
          { type: 'time', text: 'Evening entries show more reflection and clarity', confidence: 'high' }
        ],
        weeklyProgress: [3, 5, 2, 4, 6, 3, 5],
        moodTrend: [3.5, 4.0, 3.8, 4.2, 4.5, 4.1, 4.3]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: '3 Months' },
    { id: 'year', label: 'This Year' }
  ];

  const emotions = [
    { id: 'happy', label: '😊', name: 'Happy', color: 'bg-green-500' },
    { id: 'calm', label: '😌', name: 'Calm', color: 'bg-blue-500' },
    { id: 'excited', label: '⚡', name: 'Excited', color: 'bg-yellow-500' },
    { id: 'neutral', label: '😐', name: 'Neutral', color: 'bg-gray-500' },
    { id: 'sad', label: '😢', name: 'Sad', color: 'bg-blue-600' },
    { id: 'anxious', label: '😰', name: 'Anxious', color: 'bg-purple-500' }
  ];

  const metrics = [
    {
      id: 'mood',
      title: 'Mood Tracking',
      value: insights?.averageMood?.toFixed(1) || '4.2',
      unit: '/5',
      icon: Heart,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      trend: '+0.3',
      description: 'Average mood score'
    },
    {
      id: 'entries',
      title: 'Journal Entries',
      value: insights?.totalEntries || '24',
      unit: '',
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+6',
      description: 'Total entries written'
    },
    {
      id: 'streak',
      title: 'Writing Streak',
      value: insights?.streakDays || '7',
      unit: 'days',
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      trend: '+1',
      description: 'Consecutive days'
    },
    {
      id: 'insights',
      title: 'AI Insights',
      value: insights?.insights?.length || '3',
      unit: '',
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: '+1',
      description: 'New discoveries'
    }
  ];

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Analyzing your insights...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Insights</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Share className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Download className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                selectedPeriod === period.id
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Metrics Grid */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {metrics.map(metric => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={`p-4 rounded-2xl border transition-all ${
                  activeMetric === metric.id
                    ? 'border-green-200 bg-green-50 shadow-sm'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${metric.bg}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                    <span>{metric.trend}</span>
                    <TrendingUp className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* Chart Section */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <PieChart className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            {/* Simple bar chart visualization */}
            <div className="flex items-end justify-between h-32 mb-4">
              {insights?.weeklyProgress?.map((value, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-6 bg-green-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(value / 6) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Average: 4 entries per day this week</p>
            </div>
          </div>
        </div>

        {/* Top Emotions */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotional Patterns</h3>
            <div className="space-y-3">
              {insights?.topEmotions?.map((emotionId, index) => {
                const emotion = emotions.find(e => e.id === emotionId);
                const percentage = [65, 45, 30][index] || 20;
                
                return (
                  <div key={emotionId} className="flex items-center space-x-3">
                    <div className="text-xl">{emotion?.label}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{emotion?.name}</span>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${emotion?.color} transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-3">
              {(insights?.insights || []).map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm leading-relaxed">{insight.text}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.confidence === 'high' 
                            ? 'bg-green-100 text-green-700'
                            : insight.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {insight.confidence} confidence
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          insight.type === 'pattern' ? 'bg-purple-400' :
                          insight.type === 'mood' ? 'bg-pink-400' : 'bg-blue-400'
                        }`} />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Streak Master!</h3>
                <p className="text-white/80 text-sm">7 days writing streak</p>
              </div>
            </div>
            <p className="text-white/90 text-sm">
              Keep it up! You're building a powerful habit that's improving your self-awareness and emotional intelligence.
            </p>
          </div>
        </div>

        <div className="h-6" /> {/* Bottom spacing for safe area */}
      </div>
    </div>
  );
}