'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LEARNING_MODULES, LearningModule, LearningStep, QuizQuestion } from '@/lib/learning-modules';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, BookOpen, Clock, Award, Code, Play, Lightbulb } from 'lucide-react';
import JsonViewer from '@/components/JsonViewer';

export default function LearningModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [showQuizResults, setShowQuizResults] = useState<Record<string, boolean>>({});

  const module: LearningModule | undefined = LEARNING_MODULES[moduleId];
  
  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`learning-progress-${moduleId}`);
    if (savedProgress) {
      const { completed, step } = JSON.parse(savedProgress);
      setCompletedSteps(new Set(completed));
      setCurrentStepIndex(step || 0);
    }
  }, [moduleId]);

  const saveProgress = () => {
    const progress = {
      completed: Array.from(completedSteps),
      step: currentStepIndex
    };
    localStorage.setItem(`learning-progress-${moduleId}`, JSON.stringify(progress));
  };

  const markStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    saveProgress();
  };

  const handleQuizAnswer = (questionId: string, answer: any) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const showQuizResult = (questionId: string) => {
    setShowQuizResults(prev => ({ ...prev, [questionId]: true }));
  };

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h1>
          <p className="text-gray-600 mb-6">The learning module "{moduleId}" could not be found.</p>
          <button
            onClick={() => router.push('/learn')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Learning Center
          </button>
        </div>
      </div>
    );
  }

  const currentStep = module.steps[currentStepIndex];
  const isLastStep = currentStepIndex === module.steps.length - 1;
  const progressPercentage = ((currentStepIndex + 1) / module.steps.length) * 100;

  const nextStep = () => {
    if (currentStepIndex < module.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      saveProgress();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      saveProgress();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/learn')}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Learning Center
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{module.title}</h1>
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {module.steps.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Module Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Module Progress</h3>
              <div className="space-y-3">
                {module.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      index === currentStepIndex
                        ? 'bg-blue-50 border border-blue-200'
                        : index < currentStepIndex || completedSteps.has(step.id)
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {completedSteps.has(step.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className={`font-medium ${
                          index === currentStepIndex ? 'text-blue-900' : 
                          completedSteps.has(step.id) ? 'text-green-900' : 'text-gray-700'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Step Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                    <p className="text-gray-600 mt-1">{currentStep.description}</p>
                  </div>
                  {currentStep.resourceFocus && (
                    <button
                      onClick={() => router.push(`/resource/${currentStep.resourceFocus}`)}
                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View {currentStep.resourceFocus}
                    </button>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <StepContent 
                  step={currentStep}
                  quizAnswers={quizAnswers}
                  showQuizResults={showQuizResults}
                  onQuizAnswer={handleQuizAnswer}
                  onShowQuizResult={showQuizResult}
                  onStepComplete={() => markStepComplete(currentStep.id)}
                />
              </div>

              {/* Navigation */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={previousStep}
                    disabled={currentStepIndex === 0}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                      currentStepIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-4">
                    {!completedSteps.has(currentStep.id) && (
                      <button
                        onClick={() => markStepComplete(currentStep.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </button>
                    )}

                    {isLastStep ? (
                      <button
                        onClick={() => router.push('/learn')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Finish Module
                      </button>
                    ) : (
                      <button
                        onClick={nextStep}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepContent({ 
  step, 
  quizAnswers, 
  showQuizResults, 
  onQuizAnswer, 
  onShowQuizResult, 
  onStepComplete 
}: {
  step: LearningStep;
  quizAnswers: Record<string, any>;
  showQuizResults: Record<string, boolean>;
  onQuizAnswer: (questionId: string, answer: any) => void;
  onShowQuizResult: (questionId: string) => void;
  onStepComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="prose prose-blue max-w-none">
        <div 
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: step.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^/, '<p>')
              .replace(/$/, '</p>')
          }}
        />
      </div>

      {/* Code Example */}
      {step.codeExample && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-1">
          <div className="flex items-center justify-between p-3 bg-gray-100 rounded-t">
            <div className="flex items-center">
              <Code className="h-5 w-5 text-gray-600 mr-2" />
              <span className="font-medium text-gray-900">FHIR Example</span>
            </div>
          </div>
          <JsonViewer 
            data={JSON.parse(step.codeExample)}
            maxHeight="max-h-64"
          />
        </div>
      )}

      {/* Quiz Section */}
      {step.quiz && step.quiz.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-900">Knowledge Check</h3>
          </div>
          
          <div className="space-y-4">
            {step.quiz.map((question) => (
              <QuizQuestion
                key={question.id}
                question={question}
                selectedAnswer={quizAnswers[question.id]}
                showResult={showQuizResults[question.id]}
                onAnswer={(answer) => onQuizAnswer(question.id, answer)}
                onShowResult={() => onShowQuizResult(question.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Elements */}
      {step.interactive && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Play className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-900">Interactive Exercise</h3>
          </div>
          <p className="text-green-800">
            Interactive exercises will be available in future updates. For now, practice with the code examples above!
          </p>
        </div>
      )}
    </div>
  );
}

function QuizQuestion({ 
  question, 
  selectedAnswer, 
  showResult, 
  onAnswer, 
  onShowResult 
}: {
  question: QuizQuestion;
  selectedAnswer: any;
  showResult: boolean;
  onAnswer: (answer: any) => void;
  onShowResult: () => void;
}) {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">{question.question}</h4>
      
      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-2 mb-4">
          {question.options.map((option, index) => (
            <label key={index} className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value={index}
                checked={selectedAnswer === index}
                onChange={() => onAnswer(index)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'true-false' && (
        <div className="space-y-2 mb-4">
          {['True', 'False'].map((option, index) => (
            <label key={index} className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value={index === 0}
                checked={selectedAnswer === (index === 0)}
                onChange={() => onAnswer(index === 0)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-3">
        <button
          onClick={onShowResult}
          disabled={selectedAnswer === undefined}
          className={`px-4 py-2 rounded text-sm font-medium ${
            selectedAnswer === undefined
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Check Answer
        </button>

        {showResult && (
          <div className={`flex items-center text-sm font-medium ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </div>
        )}
      </div>

      {showResult && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {question.explanation}
        </div>
      )}
    </div>
  );
}