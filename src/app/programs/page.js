'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, Clock, Target, Users, Star, 
  Play, Lock, ChevronRight, BookOpen, Award
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/subscription/UpgradeModal';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const router = useRouter();
  const { subscription } = useSubscription();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Self-Awareness', label: 'Self-Awareness' },
    { value: 'Emotional Intelligence', label: 'Emotional Intelligence' },
    { value: 'Relationships', label: 'Relationships' },
    { value: 'Personal Growth', label: 'Personal Growth' },
    { value: 'Mindfulness', label: 'Mindfulness' },
    { value: 'Life Skills', label: 'Life Skills' }
  ];

  const tiers = [
    { value: 'all', label: 'All Programs' },
    { value: 'free', label: 'Free Programs' },
    { value: 'premium', label: 'Premium Programs' }
  ];

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, selectedCategory, selectedTier]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      const data = await response.json();
      
      if (data.success) {
        setPrograms(data.programs);
      } else {
        console.error('Failed to fetch programs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = programs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(program => program.category === selectedCategory);
    }

    // Filter by tier
    if (selectedTier !== 'all') {
      filtered = filtered.filter(program => program.tier_required === selectedTier);
    }

    setFilteredPrograms(filtered);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleProgramClick = (program) => {
    if (program.requires_upgrade) {
      setSelectedProgram(program);
      setShowUpgradeModal(true);
    } else {
      router.push(`/programs/${program.slug}`);
    }
  };

  const getProgressWidth = (percentage) => {
    return Math.max(percentage || 0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0B3D91] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Personal Development Programs
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Structured pathways to transform your thinking, improve your wellbeing, 
              and unlock your full potential through daily guided lessons.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent"
            >
              {tiers.map(tier => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600">
            Showing {filteredPrograms.length} of {programs.length} programs
          </p>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find programs.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                onClick={() => handleProgramClick(program)}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                  program.requires_upgrade ? 'ring-2 ring-purple-200' : ''
                }`}
              >
                {/* Program Header */}
                <div className="bg-gradient-to-br from-[#0B3D91] via-[#A56CC1] to-[#FFC857] text-white p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                      {program.tagline && (
                        <p className="text-sm opacity-90">{program.tagline}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      {program.tier_required === 'free' ? (
                        <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          FREE
                        </span>
                      ) : (
                        <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          PREMIUM
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for enrolled programs */}
                  {program.is_enrolled && program.user_progress && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs">
                          Day {program.user_progress.current_day} of {program.duration_days}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-white h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressWidth(program.user_progress.completion_percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{program.duration_days} days</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      <span>{program.difficulty_level}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span>{program.category}</span>
                    </div>
                  </div>
                </div>

                {/* Program Body */}
                <div className="p-6">
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {program.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(program.difficulty_level)}`}>
                        {program.difficulty_level}
                      </span>
                      {program.program_lessons && (
                        <span className="text-xs text-gray-500">
                          {program.program_lessons.length} lessons
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {program.requires_upgrade ? (
                        <Lock className="h-4 w-4 text-purple-600" />
                      ) : program.is_enrolled ? (
                        program.user_progress?.completion_percentage === 100 ? (
                          <Award className="h-4 w-4 text-green-600" />
                        ) : (
                          <Play className="h-4 w-4 text-[#0B3D91]" />
                        )
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {program.requires_upgrade ? (
                      <span className="text-xs font-medium text-purple-600">
                        Upgrade Required
                      </span>
                    ) : program.is_enrolled ? (
                      program.user_progress?.completion_percentage === 100 ? (
                        <span className="text-xs font-medium text-green-600">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[#0B3D91]">
                          In Progress ({Math.round(program.user_progress?.completion_percentage || 0)}%)
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        Available to Start
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="programs_index"
        program={selectedProgram}
      />
    </div>
  );
}