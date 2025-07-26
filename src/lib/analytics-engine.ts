// Advanced analytics engine for tracking usage patterns and learning insights

export interface UserSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  pages: PageVisit[];
  interactions: UserInteraction[];
  learningMetrics: LearningMetrics;
  browserInfo: BrowserInfo;
  deviceInfo: DeviceInfo;
}

export interface PageVisit {
  page: string;
  path: string;
  enterTime: string;
  exitTime?: string;
  duration?: number;
  scrollDepth: number; // percentage
  interactions: number;
}

export interface UserInteraction {
  id: string;
  type: 'click' | 'search' | 'filter' | 'share' | 'download' | 'like' | 'comment' | 'quiz_answer' | 'code_generate' | 'resource_view';
  timestamp: string;
  target: string;
  context: {
    page: string;
    resourceType?: string;
    searchQuery?: string;
    filters?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  duration?: number;
}

export interface LearningMetrics {
  modulesStarted: number;
  modulesCompleted: number;
  quizzesAttempted: number;
  quizScore: number;
  timeSpentLearning: number; // in minutes
  resourcesExplored: string[];
  searchQueries: string[];
  codeExamples: number;
  helpRequests: number;
  errorEncounters: number;
}

export interface BrowserInfo {
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  viewportSize: string;
  colorDepth: number;
  cookiesEnabled: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: string;
  browser: string;
  isTouchDevice: boolean;
}

export interface AnalyticsInsight {
  id: string;
  type: 'learning_pattern' | 'usage_trend' | 'performance_metric' | 'user_behavior' | 'content_effectiveness';
  title: string;
  description: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  importance: 'high' | 'medium' | 'low';
  recommendation?: string;
  timeframe: string;
  metadata: Record<string, any>;
}

export interface ResourceAnalytics {
  resourceType: string;
  totalViews: number;
  uniqueViews: number;
  avgTimeSpent: number;
  searchRank: number;
  difficultyConcepts: string[];
  popularExamples: string[];
  userRatings: number[];
  completionRate: number;
}

export interface LearningPathAnalytics {
  pathId: string;
  enrollments: number;
  completions: number;
  avgCompletionTime: number;
  dropoffPoints: Array<{
    step: string;
    dropoffRate: number;
  }>;
  userFeedback: Array<{
    rating: number;
    comment?: string;
    timestamp: string;
  }>;
}

export class AnalyticsEngine {
  private sessions: Map<string, UserSession> = new Map();
  private currentSession: UserSession | null = null;
  private insights: AnalyticsInsight[] = [];
  private resourceAnalytics: Map<string, ResourceAnalytics> = new Map();
  private learningPathAnalytics: Map<string, LearningPathAnalytics> = new Map();

  constructor() {
    this.loadStoredData();
    this.initializeSession();
    this.setupEventListeners();
  }

  private loadStoredData() {
    try {
      const stored = localStorage.getItem('fhir-analytics-data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.sessions) {
          data.sessions.forEach((session: UserSession) => {
            this.sessions.set(session.id, session);
          });
        }
        if (data.resourceAnalytics) {
          Object.entries(data.resourceAnalytics).forEach(([key, value]) => {
            this.resourceAnalytics.set(key, value as ResourceAnalytics);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  }

  private saveData() {
    try {
      const data = {
        sessions: Array.from(this.sessions.values()).slice(-100), // Keep last 100 sessions
        resourceAnalytics: Object.fromEntries(this.resourceAnalytics)
      };
      localStorage.setItem('fhir-analytics-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  private initializeSession() {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = this.getUserId();
    
    this.currentSession = {
      id: sessionId,
      userId,
      startTime: new Date().toISOString(),
      pages: [],
      interactions: [],
      learningMetrics: {
        modulesStarted: 0,
        modulesCompleted: 0,
        quizzesAttempted: 0,
        quizScore: 0,
        timeSpentLearning: 0,
        resourcesExplored: [],
        searchQueries: [],
        codeExamples: 0,
        helpRequests: 0,
        errorEncounters: 0
      },
      browserInfo: this.getBrowserInfo(),
      deviceInfo: this.getDeviceInfo()
    };

    this.sessions.set(sessionId, this.currentSession);
  }

  private getUserId(): string {
    let userId = localStorage.getItem('fhir-user-id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('fhir-user-id', userId);
    }
    return userId;
  }

  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      cookiesEnabled: navigator.cookieEnabled
    };
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent) && !isMobile;
    
    let os = 'Unknown';
    if (userAgent.includes('windows')) os = 'Windows';
    else if (userAgent.includes('mac')) os = 'macOS';
    else if (userAgent.includes('linux')) os = 'Linux';
    else if (userAgent.includes('android')) os = 'Android';
    else if (userAgent.includes('ios')) os = 'iOS';

    let browser = 'Unknown';
    if (userAgent.includes('chrome')) browser = 'Chrome';
    else if (userAgent.includes('firefox')) browser = 'Firefox';
    else if (userAgent.includes('safari')) browser = 'Safari';
    else if (userAgent.includes('edge')) browser = 'Edge';

    return {
      type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      os,
      browser,
      isTouchDevice: 'ontouchstart' in window
    };
  }

  private setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endCurrentPageVisit();
      } else {
        this.startPageVisit(window.location.pathname);
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth || 0);
      
      if (this.currentSession && this.currentSession.pages.length > 0) {
        const currentPage = this.currentSession.pages[this.currentSession.pages.length - 1];
        currentPage.scrollDepth = maxScrollDepth;
      }
    });

    // Track resize
    window.addEventListener('resize', () => {
      if (this.currentSession) {
        this.currentSession.browserInfo.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
      }
    });
  }

  // Public API methods
  startPageVisit(path: string) {
    if (!this.currentSession) return;

    // End previous page visit
    this.endCurrentPageVisit();

    const pageVisit: PageVisit = {
      page: this.getPageName(path),
      path,
      enterTime: new Date().toISOString(),
      scrollDepth: 0,
      interactions: 0
    };

    this.currentSession.pages.push(pageVisit);
  }

  private endCurrentPageVisit() {
    if (!this.currentSession || this.currentSession.pages.length === 0) return;

    const currentPage = this.currentSession.pages[this.currentSession.pages.length - 1];
    if (!currentPage.exitTime) {
      currentPage.exitTime = new Date().toISOString();
      currentPage.duration = Math.round((new Date(currentPage.exitTime).getTime() - new Date(currentPage.enterTime).getTime()) / 1000);
    }
  }

  private getPageName(path: string): string {
    const pathMap: Record<string, string> = {
      '/': 'Resource Explorer',
      '/learn': 'Learning Center',
      '/playground': 'FHIR Playground',
      '/relationships': 'Relationship Mapping',
      '/fhirpath': 'FHIRPath Playground',
      '/profiles': 'Schema Tools',
      '/collaborate': 'Collaboration',
      '/servers': 'Server Integration'
    };

    // Handle dynamic routes
    if (path.startsWith('/resource/')) return 'Resource Detail';
    if (path.startsWith('/learn/')) return 'Learning Module';
    
    return pathMap[path] || 'Unknown Page';
  }

  trackInteraction(type: UserInteraction['type'], target: string, context: UserInteraction['context'], duration?: number) {
    if (!this.currentSession) return;

    const interaction: UserInteraction = {
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      target,
      context,
      duration
    };

    this.currentSession.interactions.push(interaction);

    // Update current page interaction count
    if (this.currentSession.pages.length > 0) {
      this.currentSession.pages[this.currentSession.pages.length - 1].interactions++;
    }

    // Update learning metrics
    this.updateLearningMetrics(type, context);

    // Update resource analytics
    if (context.resourceType) {
      this.updateResourceAnalytics(context.resourceType, type);
    }

    this.saveData();
  }

  private updateLearningMetrics(type: UserInteraction['type'], context: UserInteraction['context']) {
    if (!this.currentSession) return;

    const metrics = this.currentSession.learningMetrics;

    switch (type) {
      case 'search':
        if (context.searchQuery) {
          metrics.searchQueries.push(context.searchQuery);
        }
        break;
      case 'resource_view':
        if (context.resourceType && !metrics.resourcesExplored.includes(context.resourceType)) {
          metrics.resourcesExplored.push(context.resourceType);
        }
        break;
      case 'code_generate':
        metrics.codeExamples++;
        break;
      case 'quiz_answer':
        metrics.quizzesAttempted++;
        if (context.metadata?.correct) {
          metrics.quizScore++;
        }
        break;
    }
  }

  private updateResourceAnalytics(resourceType: string, interactionType: UserInteraction['type']) {
    let analytics = this.resourceAnalytics.get(resourceType);
    
    if (!analytics) {
      analytics = {
        resourceType,
        totalViews: 0,
        uniqueViews: 0,
        avgTimeSpent: 0,
        searchRank: 0,
        difficultyConcepts: [],
        popularExamples: [],
        userRatings: [],
        completionRate: 0
      };
      this.resourceAnalytics.set(resourceType, analytics);
    }

    if (interactionType === 'resource_view') {
      analytics.totalViews++;
      // Track unique views per session
      if (this.currentSession && !this.currentSession.learningMetrics.resourcesExplored.includes(resourceType)) {
        analytics.uniqueViews++;
      }
    }
  }

  endSession() {
    if (!this.currentSession) return;

    this.endCurrentPageVisit();
    
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = Math.round(
      (new Date(this.currentSession.endTime).getTime() - new Date(this.currentSession.startTime).getTime()) / 1000
    );

    this.saveData();
    this.generateInsights();
  }

  // Analytics and Insights
  generateInsights(): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const allSessions = Array.from(this.sessions.values());
    const recentSessions = allSessions.filter(s => 
      new Date(s.startTime).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    // Learning engagement insight
    const avgSessionDuration = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length;
    insights.push({
      id: 'learning-engagement',
      type: 'learning_pattern',
      title: 'Learning Engagement',
      description: 'Average time spent per learning session',
      value: Math.round(avgSessionDuration / 60), // Convert to minutes
      trend: this.getTrend('session_duration', avgSessionDuration),
      importance: 'high',
      recommendation: avgSessionDuration < 300 ? 'Consider adding more interactive elements to increase engagement' : undefined,
      timeframe: 'Last 7 days',
      metadata: { unit: 'minutes' }
    });

    // Popular resources insight
    const resourceViews = new Map<string, number>();
    recentSessions.forEach(session => {
      session.learningMetrics.resourcesExplored.forEach(resource => {
        resourceViews.set(resource, (resourceViews.get(resource) || 0) + 1);
      });
    });

    const topResource = Array.from(resourceViews.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topResource) {
      insights.push({
        id: 'popular-resources',
        type: 'content_effectiveness',
        title: 'Most Popular Resource',
        description: 'Resource with highest engagement',
        value: topResource[0],
        trend: 'stable',
        importance: 'medium',
        timeframe: 'Last 7 days',
        metadata: { views: topResource[1] }
      });
    }

    // Device usage insight
    const deviceTypes = recentSessions.reduce((acc, session) => {
      acc[session.deviceInfo.type] = (acc[session.deviceInfo.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSessions = recentSessions.length;
    const mobilePercentage = Math.round((deviceTypes.mobile || 0) / totalSessions * 100);
    insights.push({
      id: 'device-usage',
      type: 'user_behavior',
      title: 'Mobile Usage',
      description: 'Percentage of sessions from mobile devices',
      value: mobilePercentage,
      trend: this.getTrend('mobile_usage', mobilePercentage),
      importance: 'medium',
      recommendation: mobilePercentage > 40 ? 'Continue optimizing mobile experience' : 'Consider improving mobile interface',
      timeframe: 'Last 7 days',
      metadata: { unit: '%' }
    });

    // Search effectiveness
    const searchQueries = recentSessions.flatMap(s => s.learningMetrics.searchQueries);
    const uniqueSearches = new Set(searchQueries).size;
    insights.push({
      id: 'search-diversity',
      type: 'usage_trend',
      title: 'Search Diversity',
      description: 'Number of unique search queries',
      value: uniqueSearches,
      trend: this.getTrend('search_diversity', uniqueSearches),
      importance: 'low',
      timeframe: 'Last 7 days',
      metadata: { totalSearches: searchQueries.length }
    });

    this.insights = insights;
    return insights;
  }

  private getTrend(metric: string, currentValue: number): 'up' | 'down' | 'stable' {
    // Simplified trend calculation - in a real implementation, this would compare with historical data
    const randomTrend = Math.random();
    if (randomTrend < 0.33) return 'up';
    if (randomTrend < 0.66) return 'down';
    return 'stable';
  }

  getInsights(): AnalyticsInsight[] {
    return this.insights;
  }

  getUserMetrics(userId?: string): any {
    const userSessions = Array.from(this.sessions.values()).filter(s => 
      !userId || s.userId === userId
    );

    const totalSessions = userSessions.length;
    const totalDuration = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalInteractions = userSessions.reduce((sum, s) => sum + s.interactions.length, 0);

    const uniqueResources = new Set();
    const totalQuizzes = userSessions.reduce((sum, s) => sum + s.learningMetrics.quizzesAttempted, 0);
    const totalScore = userSessions.reduce((sum, s) => sum + s.learningMetrics.quizScore, 0);

    userSessions.forEach(session => {
      session.learningMetrics.resourcesExplored.forEach(resource => {
        uniqueResources.add(resource);
      });
    });

    return {
      totalSessions,
      totalDuration: Math.round(totalDuration / 60), // minutes
      avgSessionDuration: totalSessions > 0 ? Math.round(totalDuration / totalSessions / 60) : 0,
      totalInteractions,
      uniqueResourcesExplored: uniqueResources.size,
      totalQuizzes,
      quizAccuracy: totalQuizzes > 0 ? Math.round((totalScore / totalQuizzes) * 100) : 0,
      lastActivity: userSessions.length > 0 ? userSessions[userSessions.length - 1].startTime : null
    };
  }

  getResourceAnalytics(): ResourceAnalytics[] {
    return Array.from(this.resourceAnalytics.values());
  }

  exportAnalytics(): string {
    return JSON.stringify({
      sessions: Array.from(this.sessions.values()),
      insights: this.insights,
      resourceAnalytics: Array.from(this.resourceAnalytics.entries()),
      generatedAt: new Date().toISOString()
    }, null, 2);
  }

  // Real-time tracking helpers
  trackPageView(path: string) {
    this.startPageVisit(path);
  }

  trackSearch(query: string, filters?: Record<string, any>) {
    this.trackInteraction('search', 'search-input', {
      page: window.location.pathname,
      searchQuery: query,
      filters
    });
  }

  trackResourceView(resourceType: string, resourceId?: string) {
    this.trackInteraction('resource_view', resourceId || resourceType, {
      page: window.location.pathname,
      resourceType
    });
  }

  trackCodeGeneration(format: string, resourceType: string) {
    this.trackInteraction('code_generate', `${format}-${resourceType}`, {
      page: window.location.pathname,
      resourceType,
      metadata: { format }
    });
  }

  trackQuizAnswer(questionId: string, correct: boolean, timeTaken: number) {
    this.trackInteraction('quiz_answer', questionId, {
      page: window.location.pathname,
      metadata: { correct, timeTaken }
    }, timeTaken);
  }

  trackShare(type: string, resourceId: string) {
    this.trackInteraction('share', resourceId, {
      page: window.location.pathname,
      metadata: { shareType: type }
    });
  }

  trackDownload(resourceType: string, format: string) {
    this.trackInteraction('download', `${resourceType}-${format}`, {
      page: window.location.pathname,
      resourceType,
      metadata: { format }
    });
  }
}

// Singleton instance
export const analyticsEngine = new AnalyticsEngine();