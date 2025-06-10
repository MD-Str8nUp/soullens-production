'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, Target, Users, CheckCircle, Play, Lock, 
  Calendar, Star, Award, BookOpen, MessageCircle
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/subscription/UpgradeModal';

export default function ProgramDetailPage({ params }) {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();
  const { subscription } = useSubscription();
  const { slug } = params;

  useEffect(() => {
    fetchProgramDetails();
  }, [slug]);

  const fetchProgramDetails = async () => {
    try {
      const response = await fetch(`/api/programs/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setProgram(data.program);
      } else {
        router.push('/programs');
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
      router.push('/programs');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (program.requires_upgrade) {
      setShowUpgradeModal(true);
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program_id: program.id,
          action: 'enroll'
        }),
      });

      if (response.ok) {
        // Refresh program data to show enrollment
        fetchProgramDetails();
      } else {
        const error = await response.json();
        if (error.requires_upgrade) {
          setShowUpgradeModal(true);
        }
      }
    } catch (error) {
      console.error('Error enrolling in program:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLesson = (lessonId) => {
    router.push(`/programs/${slug}/lessons/${lessonId}`);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0B3D91] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading program...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Program not found</h2>
          <button
            onClick={() => router.push('/programs')}
            className="mt-4 text-[#0B3D91] hover:underline"
          >
            Return to programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/programs')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Programs
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Program Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-[#0B3D91] via-[#A56CC1] to-[#FFC857] text-white p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{program.name}</h1>
                <p className="text-xl opacity-90">{program.tagline}</p>
              </div>
              <div className="text-right">
                {program.tier_required === 'free' ? (
                  <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    FREE
                  </span>
                ) : (
                  <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{program.duration_days} days</span>
              </div>
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                <span>{program.difficulty_level}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>{program.category}</span>
              </div>
            </div>

            {/* Progress Bar (if enrolled) */}
            {program.is_enrolled && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">
                    Day {program.user_progress.current_day} of {program.duration_days}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${program.user_progress.completion_percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>{Math.round(program.user_progress.completion_percentage)}% Complete</span>
                  {program.user_progress.streak_count > 0 && (
                    <span>🔥 {program.user_progress.streak_count} day streak</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Program</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {program.detailed_description || program.description}
                  </p>
                </div>

                {/* What You'll Learn */}
                {program.learning_outcomes && program.learning_outcomes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                    <ul className="space-y-3">
                      {program.learning_outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prerequisites */}
                {program.prerequisites && program.prerequisites.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Prerequisites</h3>
                    <ul className="space-y-2">
                      {program.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-2 w-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div>
                {/* Action Button */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  {program.requires_upgrade ? (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Upgrade to Access
                    </button>
                  ) : program.is_enrolled ? (
                    program.user_progress?.completion_percentage === 100 ? (
                      <div className="text-center">
                        <div className="bg-green-100 text-green-800 py-3 px-4 rounded-lg font-semibold flex items-center justify-center mb-4">
                          <Award className="h-5 w-5 mr-2" />
                          Program Completed!
                        </div>
                        <button
                          onClick={() => router.push('/chat')}
                          className="w-full bg-[#0B3D91] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#0B3D91]/90 transition-colors flex items-center justify-center"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Discuss Your Progress
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const nextLesson = program.lessons.find(l => l.day_number === program.user_progress.current_day);
                          if (nextLesson) handleStartLesson(nextLesson.id);
                        }}
                        className="w-full bg-[#0B3D91] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0B3D91]/90 transition-colors flex items-center justify-center"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Continue Day {program.user_progress.current_day}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-[#0B3D91] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0B3D91]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {enrolling ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Play className="h-5 w-5 mr-2" />
                      )}
                      {enrolling ? 'Enrolling...' : 'Start Program'}
                    </button>
                  )}
                </div>

                {/* Program Stats */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Program Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{program.duration_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(program.difficulty_level)}`}>
                        {program.difficulty_level}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lessons</span>
                      <span className="font-medium">{program.lessons?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time/Day</span>
                      <span className="font-medium">15-30 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Preview */}
        {program.lessons && program.lessons.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Program Structure</h2>
            <div className="space-y-4">
              {program.lessons.slice(0, 5).map((lesson) => (
                <div
                  key={lesson.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    lesson.is_completed
                      ? 'border-green-200 bg-green-50'
                      : lesson.is_available
                      ? 'border-[#0B3D91] bg-blue-50 cursor-pointer hover:bg-blue-100'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => lesson.is_available && handleStartLesson(lesson.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
                        lesson.is_completed
                          ? 'bg-green-500 text-white'
                          : lesson.is_available
                          ? 'bg-[#0B3D91] text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {lesson.is_completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          lesson.day_number
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Day {lesson.day_number}: {lesson.title}
                        </h4>
                        {lesson.subtitle && (
                          <p className="text-sm text-gray-600">{lesson.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {lesson.estimated_duration && (
                        <span className="text-sm text-gray-500 mr-3">
                          {lesson.estimated_duration} min
                        </span>
                      )}
                      {!lesson.is_available && !lesson.is_completed && (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      {lesson.is_available && !lesson.is_completed && (
                        <Play className="h-4 w-4 text-[#0B3D91]" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {program.lessons.length > 5 && (
                <div className="text-center py-4">
                  <span className="text-gray-500">
                    +{program.lessons.length - 5} more lessons
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="program_detail"
        program={program}
      />
    </div>
  );
}