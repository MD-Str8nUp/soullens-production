'use client'

import Header from '@/components/navigation/Header'
import { Calendar, MessageSquare, TrendingUp, Award } from 'lucide-react'

export default function Journey() {
  // Placeholder milestones for demonstration
  const milestones = [
    {
      date: 'Today',
      title: 'Started your SoulLens journey',
      description: 'Welcome! Your personal growth adventure begins.',
      icon: Award,
      completed: true,
    },
    {
      date: 'Next milestone',
      title: 'Complete 10 conversations',
      description: 'Engage in meaningful dialogues to unlock deeper insights.',
      icon: MessageSquare,
      completed: false,
      progress: 20,
    },
    {
      date: 'Future milestone',
      title: 'Discover your first pattern',
      description: 'Identify recurring themes in your thoughts and emotions.',
      icon: TrendingUp,
      completed: false,
      progress: 0,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray">
      <Header />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Journey</h1>
          <p className="text-gray-600">Track your personal development milestones</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-brand-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-2xl font-bold text-brand-navy">20%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-brand-navy h-3 rounded-full" style={{ width: '20%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Keep going! You're making great progress.</p>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-brand-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Milestones</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon
              return (
                <div key={index} className="relative">
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        milestone.completed
                          ? 'bg-brand-navy text-brand-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                        {milestone.completed && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                      <p className="text-xs text-gray-500">{milestone.date}</p>
                      {milestone.progress !== undefined && milestone.progress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-brand-navy h-2 rounded-full"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{milestone.progress}% complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Encouragement */}
        <div className="mt-8 text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Your journey is unique. Take your time and enjoy the process of self-discovery.
          </p>
        </div>
      </main>
    </div>
  )
}