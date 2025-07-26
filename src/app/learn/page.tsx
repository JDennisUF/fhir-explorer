'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LEARNING_MODULES, getLearningModulesByCategory, getLearningModulesByDifficulty, LearningModule } from '@/lib/learning-modules';
import { BookOpen, Clock, Award, Users, Brain, Stethoscope, Settings, ChevronRight, Star } from 'lucide-react';

export default function LearningCenter() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const categories = [
    { id: 'foundation', label: 'Foundation', icon: Settings, description: 'Core FHIR concepts and structure' },
    { id: 'clinical', label: 'Clinical', icon: Stethoscope, description: 'Patient care and clinical workflows' },
    { id: 'integration', label: 'Integration', icon: Users, description: 'Connecting systems and data exchange' },
    { id: 'advanced', label: 'Advanced', icon: Brain, description: 'Complex scenarios and best practices' }
  ];

  const difficulties = [
    { id: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800', icon: '🟢' },
    { id: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    { id: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800', icon: '🔴' }
  ];

  const filteredModules = Object.values(LEARNING_MODULES).filter(module => 
    (!selectedCategory || module.category === selectedCategory) &&
    (!selectedDifficulty || module.difficulty === selectedDifficulty)
  );

  const getDifficultyStyle = (difficulty: string) => {
    const difficultyObj = difficulties.find(d => d.id === difficulty);
    return difficultyObj?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
              <p className="text-gray-600 mt-1">Interactive tutorials and guided learning paths for FHIR mastery</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Back to Explorer
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{Object.keys(LEARNING_MODULES).length}</p>
                <p className="text-gray-600">Learning Modules</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">2-3h</p>
                <p className="text-gray-600">Total Learning Time</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">Interactive</p>
                <p className="text-gray-600">Hands-on Learning</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">Beginner</p>
                <p className="text-gray-600">Friendly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {categories.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedCategory === id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <Icon className={`h-6 w-6 mb-2 ${selectedCategory === id ? 'text-blue-600' : 'text-gray-600'}`} />
                <h3 className={`font-medium ${selectedCategory === id ? 'text-blue-900' : 'text-gray-900'}`}>
                  {label}
                </h3>
                <p className={`text-sm mt-1 ${selectedCategory === id ? 'text-blue-700' : 'text-gray-600'}`}>
                  {description}
                </p>
              </button>
            ))}
          </div>

          <h3 className="text-md font-medium text-gray-900 mb-3">Filter by Difficulty</h3>
          <div className="flex space-x-3">
            {difficulties.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setSelectedDifficulty(selectedDifficulty === id ? null : id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === id
                    ? getDifficultyStyle(id)
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {(selectedCategory || selectedDifficulty) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedDifficulty(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Learning Modules */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedCategory || selectedDifficulty 
                ? `Filtered Modules (${filteredModules.length})`
                : 'All Learning Modules'
              }
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredModules.map((module) => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                onClick={() => router.push(`/learn/${module.id}`)}
              />
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No modules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters to see more learning modules.
              </p>
            </div>
          )}
        </div>

        {/* Learning Path Suggestions */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recommended Learning Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900">Start with Basics</h3>
              <p className="text-sm text-gray-600 mt-2">Learn FHIR fundamentals and the 5-level hierarchy</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900">Follow Patient Journey</h3>
              <p className="text-sm text-gray-600 mt-2">Understand clinical workflows through realistic scenarios</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900">Explore Integration</h3>
              <p className="text-sm text-gray-600 mt-2">Learn how resources connect and systems integrate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ module, onClick }: { module: LearningModule; onClick: () => void }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'foundation': return Settings;
      case 'clinical': return Stethoscope;
      case 'integration': return Users;
      case 'advanced': return Brain;
      default: return BookOpen;
    }
  };

  const CategoryIcon = getCategoryIcon(module.category);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-6 cursor-pointer border border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <CategoryIcon className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                {module.difficulty}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {module.estimatedTime}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {module.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <BookOpen className="h-4 w-4 mr-1" />
          {module.steps.length} steps
        </div>
        
        {module.prerequisites && module.prerequisites.length > 0 && (
          <div className="text-xs text-gray-500">
            Prerequisites required
          </div>
        )}
      </div>
    </div>
  );
}