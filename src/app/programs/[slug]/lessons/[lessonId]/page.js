'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, CheckCircle, BookOpen, MessageCircle, 
  PenTool, Star, ArrowRight, ChevronRight
} from 'lucide-react';

export default function LessonPage({ params }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState({});
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [lessonRating, setLessonRating] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const router = useRouter();
  const { slug, lessonId } = params;

  useEffect(() => {
    fetchLessonDetails();
    setStartTime(Date.now());
  }, [lessonId]);

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      if (startTime) {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // minutes
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  const fetchLessonDetails = async () => {
    try {
      const response = await fetch(`/api/programs/lessons/${lessonId}`);
      const data = await response.json();
      
      if (data.success) {
        setLesson(data.lesson);
        if (data.lesson.user_progress?.reflection_notes) {
          setReflectionNotes(data.lesson.user_progress.reflection_notes);
        }
        if (data.lesson.user_progress?.lesson_rating) {
          setLessonRating(data.lesson.user_progress.lesson_rating);
        }
      } else {
        router.push(`/programs/${slug}`);
      }
    } catch (error) {
      console.error('Error fetching lesson details:', error);
      router.push(`/programs/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = async () => {
    try {
      await fetch(`/api/programs/lessons/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start'
        }),
      });
      // Refresh lesson data
      fetchLessonDetails();
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const handleCompleteLesson = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch(`/api/programs/lessons/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete',
          completion_data: completionData,
          reflection_notes: reflectionNotes,
          time_spent: timeSpent,
          lesson_rating: lessonRating
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Show success and navigate back
        router.push(`/programs/${slug}?completed=${lesson.day_number}`);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderLessonContent = () => {
    if (!lesson?.lesson_content) return null;

    const content = lesson.lesson_content;

    return (
      <div className="space-y-8">
        {/* Introduction */}
        {content.introduction && (
          <div className="bg-blue-50 border-l-4 border-[#0B3D91] p-6 rounded-r-lg">
            <h3 className="font-semibold text-[#0B3D91] mb-2">Welcome to Today's Lesson</h3>
            <p className="text-gray-700 leading-relaxed">{content.introduction}</p>
          </div>
        )}

        {/* Main Content */}
        {content.main_content && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Focus</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {content.main_content}
              </p>
            </div>
          </div>
        )}

        {/* Exercise */}
        {content.exercise && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <PenTool className="h-6 w-6 text-[#FFC857] mr-3" />
              <h3 className="text-xl font-bold text-gray-900">
                {content.exercise.title || 'Exercise'}
              </h3>
            </div>
            
            {content.exercise.instructions && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {content.exercise.instructions}
                  </p>
                </div>
              </div>
            )}

            {/* Exercise Response Area */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Your Response:</h4>
              <textarea
                value={completionData.exercise_response || ''}
                onChange={(e) => setCompletionData({
                  ...completionData,
                  exercise_response: e.target.value
                })}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent resize-none"
                placeholder="Write your response to the exercise here..."
              />
            </div>

            {/* Reflection Questions */}
            {content.exercise.reflection_questions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Reflection Questions:</h4>
                <div className="space-y-4">
                  {content.exercise.reflection_questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-3 font-medium">{question}</p>
                      <textarea
                        value={completionData[`reflection_${index}`] || ''}
                        onChange={(e) => setCompletionData({
                          ...completionData,
                          [`reflection_${index}`]: e.target.value
                        })}
                        className="w-full h-24 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent resize-none"
                        placeholder="Your reflection..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Insights */}
        {content.key_insights && content.key_insights.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-6 w-6 text-purple-600 mr-3" />
              Key Insights
            </h3>
            <ul className="space-y-3">
              {content.key_insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tomorrow's Preview */}
        {content.tomorrow_preview && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Coming Up Tomorrow
            </h3>
            <p className="text-yellow-700">{content.tomorrow_preview}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0B3D91] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Lesson not found</h2>
          <button
            onClick={() => router.push(`/programs/${slug}`)}
            className="mt-4 text-[#0B3D91] hover:underline"
          >
            Return to program
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
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/programs/${slug}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Program
            </button>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{timeSpent} min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-[#0B3D91] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                  {lesson.day_number}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                  {lesson.subtitle && (
                    <p className="text-xl text-gray-600 mt-1">{lesson.subtitle}</p>
                  )}
                </div>
              </div>
              {lesson.is_completed && (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Day {lesson.day_number} of {lesson.programs.duration_days}</span>
              <span>{lesson.estimated_duration} min estimated</span>
            </div>

            {/* Learning Objectives */}
            {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-[#0B3D91] mb-2">Today's Learning Objectives:</h3>
                <ul className="space-y-1">
                  {lesson.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <ChevronRight className="h-4 w-4 text-[#0B3D91] mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Start Lesson Button */}
          {!lesson.user_progress && (
            <div className="text-center py-8">
              <button
                onClick={handleStartLesson}
                className="bg-[#0B3D91] text-white py-3 px-8 rounded-lg font-semibold hover:bg-[#0B3D91]/90 transition-colors"
              >
                Start Today's Lesson
              </button>
            </div>
          )}
        </div>

        {/* Lesson Content */}
        {lesson.user_progress && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {renderLessonContent()}
          </div>
        )}

        {/* Completion Section */}
        {lesson.user_progress && !lesson.is_completed && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Today's Lesson</h3>
            
            {/* Lesson Rating */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">How was today's lesson?</h4>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setLessonRating(rating)}
                    className={`p-2 rounded transition-colors ${
                      lessonRating >= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Reflection */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Additional Thoughts (Optional)</h4>
              <textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent resize-none"
                placeholder="Any additional insights, questions, or reflections from today's lesson..."
              />
            </div>

            {/* Integration Prompts */}
            {lesson.integration_prompts && (
              <div className="mb-6 grid md:grid-cols-2 gap-4">
                {lesson.integration_prompts.ai_chat_prompt && (
                  <button
                    onClick={() => router.push(`/chat?prompt=${encodeURIComponent(lesson.integration_prompts.ai_chat_prompt)}`)}
                    className="flex items-center justify-center p-4 border-2 border-[#A56CC1] rounded-lg text-[#A56CC1] hover:bg-[#A56CC1] hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Discuss with AI
                  </button>
                )}
                {lesson.integration_prompts.journal_prompt && (
                  <button
                    onClick={() => router.push(`/journal?prompt=${encodeURIComponent(lesson.integration_prompts.journal_prompt)}`)}
                    className="flex items-center justify-center p-4 border-2 border-purple-600 rounded-lg text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                  >
                    <PenTool className="h-5 w-5 mr-2" />
                    Journal About This
                  </button>
                )}
              </div>
            )}

            {/* Complete Button */}
            <button
              onClick={handleCompleteLesson}
              disabled={isCompleting}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCompleting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {isCompleting ? 'Completing...' : 'Complete Today\'s Lesson'}
            </button>
          </div>
        )}

        {/* Already Completed */}
        {lesson.is_completed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">Lesson Completed!</h3>
            <p className="text-green-700 mb-6">
              You completed this lesson on {new Date(lesson.user_progress.completed_date).toLocaleDateString()}
            </p>
            
            {lesson.user_progress.reflection_notes && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Your Reflection:</h4>
                <p className="text-gray-700">{lesson.user_progress.reflection_notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(`/programs/${slug}`)}
                className="bg-[#0B3D91] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#0B3D91]/90 transition-colors"
              >
                Back to Program
              </button>
              {lesson.integration_prompts?.ai_chat_prompt && (
                <button
                  onClick={() => router.push(`/chat?prompt=${encodeURIComponent(lesson.integration_prompts.ai_chat_prompt)}`)}
                  className="bg-[#A56CC1] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#A56CC1]/90 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discuss Progress
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}