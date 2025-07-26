// Collaboration features for sharing progress and examples

export interface SharedResource {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  content: any; // FHIR resource or learning content
  tags: string[];
  author: {
    name: string;
    email?: string;
    avatar?: string;
  };
  visibility: 'public' | 'private' | 'organization';
  likes: number;
  downloads: number;
  comments: Comment[];
  created: string;
  lastModified: string;
  shareUrl?: string;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    email?: string;
    avatar?: string;
  };
  content: string;
  parentId?: string; // For nested comments
  created: string;
  lastModified?: string;
  likes: number;
}

export interface LearningProgress {
  userId: string;
  userName: string;
  userAvatar?: string;
  moduleProgress: ModuleProgress[];
  achievements: Achievement[];
  totalScore: number;
  level: number;
  lastActivity: string;
  shareableUrl?: string;
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  completed: boolean;
  score: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  attempts: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'social' | 'technical' | 'milestone';
  earned: string;
  points: number;
}

export interface SharedCollection {
  id: string;
  title: string;
  description: string;
  resources: string[]; // SharedResource IDs
  author: {
    name: string;
    email?: string;
    avatar?: string;
  };
  visibility: 'public' | 'private' | 'organization';
  tags: string[];
  likes: number;
  followers: number;
  created: string;
  lastModified: string;
}

export class CollaborationManager {
  private sharedResources: Map<string, SharedResource> = new Map();
  private learningProgress: Map<string, LearningProgress> = new Map();
  private collections: Map<string, SharedCollection> = new Map();
  private currentUser: { name: string; email: string; avatar?: string } | null = null;

  constructor() {
    this.loadSampleData();
    this.loadUserProgress();
  }

  // Initialize with sample data for demonstration
  private loadSampleData() {
    const sampleResources: SharedResource[] = [
      {
        id: 'shared-patient-example',
        title: 'US Core Patient Example with Extensions',
        description: 'A comprehensive Patient resource example demonstrating US Core requirements and common extensions',
        resourceType: 'Patient',
        content: {
          resourceType: 'Patient',
          id: 'example-shared',
          meta: {
            profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
          },
          extension: [
            {
              url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
              extension: [
                {
                  url: 'ombCategory',
                  valueCoding: {
                    system: 'urn:oid:2.16.840.1.113883.6.238',
                    code: '2106-3',
                    display: 'White'
                  }
                }
              ]
            }
          ],
          identifier: [
            {
              use: 'usual',
              type: {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                    code: 'MR'
                  }
                ]
              },
              system: 'http://hospital.example.org/patient-ids',
              value: 'MRN123456'
            }
          ],
          active: true,
          name: [
            {
              use: 'official',
              family: 'Example',
              given: ['John', 'David']
            }
          ],
          gender: 'male',
          birthDate: '1980-01-01',
          address: [
            {
              use: 'home',
              line: ['123 Main Street'],
              city: 'Anytown',
              state: 'CA',
              postalCode: '12345',
              country: 'US'
            }
          ]
        },
        tags: ['us-core', 'patient', 'extensions', 'example'],
        author: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah@example.org',
          avatar: '👩‍⚕️'
        },
        visibility: 'public',
        likes: 15,
        downloads: 42,
        comments: [
          {
            id: 'comment-1',
            author: {
              name: 'Mike Chen',
              email: 'mike@example.com',
              avatar: '👨‍💻'
            },
            content: 'Great example! The race extension implementation is very helpful.',
            created: '2024-01-10T09:30:00Z',
            likes: 3
          },
          {
            id: 'comment-2',
            author: {
              name: 'Lisa Rodriguez',
              email: 'lisa@hospital.org',
              avatar: '👩‍💼'
            },
            content: 'Could you add an example with ethnicity extension as well?',
            created: '2024-01-11T14:15:00Z',
            likes: 1
          }
        ],
        created: '2024-01-05T08:00:00Z',
        lastModified: '2024-01-08T16:30:00Z'
      },
      {
        id: 'shared-observation-vitals',
        title: 'Blood Pressure Observation with Components',
        description: 'Example showing how to structure vital signs observations with systolic and diastolic components',
        resourceType: 'Observation',
        content: {
          resourceType: 'Observation',
          id: 'bp-example-shared',
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '85354-9',
                display: 'Blood pressure panel with all children optional'
              }
            ]
          },
          subject: {
            reference: 'Patient/example-shared'
          },
          effectiveDateTime: '2024-01-15T10:30:00Z',
          component: [
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8480-6',
                    display: 'Systolic blood pressure'
                  }
                ]
              },
              valueQuantity: {
                value: 120,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              }
            },
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8462-4',
                    display: 'Diastolic blood pressure'
                  }
                ]
              },
              valueQuantity: {
                value: 80,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              }
            }
          ]
        },
        tags: ['observation', 'vital-signs', 'blood-pressure', 'components'],
        author: {
          name: 'Dr. Mark Thompson',
          email: 'mark@clinic.org',
          avatar: '👨‍⚕️'
        },
        visibility: 'public',
        likes: 23,
        downloads: 67,
        comments: [],
        created: '2024-01-12T11:00:00Z',
        lastModified: '2024-01-12T11:00:00Z'
      }
    ];

    sampleResources.forEach(resource => {
      this.sharedResources.set(resource.id, resource);
    });

    // Sample collections
    const sampleCollection: SharedCollection = {
      id: 'us-core-examples',
      title: 'US Core Implementation Examples',
      description: 'A curated collection of FHIR resources demonstrating US Core implementation patterns',
      resources: ['shared-patient-example', 'shared-observation-vitals'],
      author: {
        name: 'US Core Working Group',
        email: 'uscore@hl7.org',
        avatar: '🏥'
      },
      visibility: 'public',
      tags: ['us-core', 'implementation', 'examples'],
      likes: 45,
      followers: 128,
      created: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-15T12:00:00Z'
    };

    this.collections.set(sampleCollection.id, sampleCollection);
  }

  private loadUserProgress() {
    // Load from localStorage or initialize
    const saved = localStorage.getItem('fhir-learning-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved) as LearningProgress;
        this.learningProgress.set(progress.userId, progress);
      } catch (error) {
        console.error('Failed to load learning progress:', error);
      }
    }
  }

  // User authentication (simplified)
  setCurrentUser(user: { name: string; email: string; avatar?: string }) {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Shared Resources
  getAllSharedResources(filters?: {
    resourceType?: string;
    tags?: string[];
    author?: string;
    visibility?: 'public' | 'private' | 'organization';
  }): SharedResource[] {
    let resources = Array.from(this.sharedResources.values());

    if (filters) {
      if (filters.resourceType) {
        resources = resources.filter(r => r.resourceType === filters.resourceType);
      }
      if (filters.tags) {
        resources = resources.filter(r => 
          filters.tags!.some(tag => r.tags.includes(tag))
        );
      }
      if (filters.author) {
        resources = resources.filter(r => 
          r.author.name.toLowerCase().includes(filters.author!.toLowerCase())
        );
      }
      if (filters.visibility) {
        resources = resources.filter(r => r.visibility === filters.visibility);
      }
    }

    // Sort by popularity (likes + downloads)
    return resources.sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads));
  }

  getSharedResource(id: string): SharedResource | undefined {
    return this.sharedResources.get(id);
  }

  shareResource(resource: Omit<SharedResource, 'id' | 'created' | 'lastModified' | 'likes' | 'downloads' | 'comments' | 'shareUrl'>): SharedResource {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to share resources');
    }

    const id = `shared-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const shareUrl = `${window.location.origin}/shared/${id}`;
    
    const sharedResource: SharedResource = {
      ...resource,
      id,
      author: this.currentUser,
      likes: 0,
      downloads: 0,
      comments: [],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      shareUrl
    };

    this.sharedResources.set(id, sharedResource);
    return sharedResource;
  }

  likeResource(resourceId: string): boolean {
    const resource = this.sharedResources.get(resourceId);
    if (resource) {
      resource.likes++;
      return true;
    }
    return false;
  }

  downloadResource(resourceId: string): any | null {
    const resource = this.sharedResources.get(resourceId);
    if (resource) {
      resource.downloads++;
      return resource.content;
    }
    return null;
  }

  addComment(resourceId: string, content: string, parentId?: string): Comment | null {
    if (!this.currentUser) return null;

    const resource = this.sharedResources.get(resourceId);
    if (!resource) return null;

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: this.currentUser,
      content,
      parentId,
      created: new Date().toISOString(),
      likes: 0
    };

    resource.comments.push(comment);
    resource.lastModified = new Date().toISOString();
    
    return comment;
  }

  // Learning Progress
  getUserProgress(userId: string): LearningProgress | undefined {
    return this.learningProgress.get(userId);
  }

  updateModuleProgress(userId: string, moduleId: string, progress: Partial<ModuleProgress>) {
    let userProgress = this.learningProgress.get(userId);
    
    if (!userProgress) {
      userProgress = {
        userId,
        userName: this.currentUser?.name || 'Anonymous',
        userAvatar: this.currentUser?.avatar,
        moduleProgress: [],
        achievements: [],
        totalScore: 0,
        level: 1,
        lastActivity: new Date().toISOString()
      };
    }

    const existingIndex = userProgress.moduleProgress.findIndex(mp => mp.moduleId === moduleId);
    
    if (existingIndex >= 0) {
      userProgress.moduleProgress[existingIndex] = {
        ...userProgress.moduleProgress[existingIndex],
        ...progress,
        lastAccessed: new Date().toISOString()
      };
    } else {
      userProgress.moduleProgress.push({
        moduleId,
        moduleName: progress.moduleName || moduleId,
        completed: false,
        score: 0,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        attempts: 1,
        ...progress
      });
    }

    // Update totals
    userProgress.totalScore = userProgress.moduleProgress.reduce((total, mp) => total + mp.score, 0);
    userProgress.level = Math.floor(userProgress.totalScore / 100) + 1;
    userProgress.lastActivity = new Date().toISOString();

    // Check for achievements
    this.checkAchievements(userProgress);

    this.learningProgress.set(userId, userProgress);
    
    // Save to localStorage
    localStorage.setItem('fhir-learning-progress', JSON.stringify(userProgress));
    
    return userProgress;
  }

  private checkAchievements(progress: LearningProgress) {
    const achievements: Achievement[] = [];
    
    // First module completed
    if (progress.moduleProgress.some(mp => mp.completed) && 
        !progress.achievements.some(a => a.id === 'first-module')) {
      achievements.push({
        id: 'first-module',
        title: 'First Steps',
        description: 'Completed your first learning module',
        icon: '🎯',
        category: 'milestone',
        earned: new Date().toISOString(),
        points: 10
      });
    }

    // Score milestones
    if (progress.totalScore >= 500 && !progress.achievements.some(a => a.id === 'score-500')) {
      achievements.push({
        id: 'score-500',
        title: 'Rising Star',
        description: 'Achieved 500 total points',
        icon: '⭐',
        category: 'learning',
        earned: new Date().toISOString(),
        points: 50
      });
    }

    // Add new achievements
    progress.achievements.push(...achievements);
  }

  generateShareableProgress(userId: string): string | null {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;

    const shareableData = {
      userName: progress.userName,
      level: progress.level,
      totalScore: progress.totalScore,
      completedModules: progress.moduleProgress.filter(mp => mp.completed).length,
      achievements: progress.achievements.map(a => ({
        title: a.title,
        icon: a.icon,
        category: a.category
      }))
    };

    const encodedData = btoa(JSON.stringify(shareableData));
    return `${window.location.origin}/progress/${encodedData}`;
  }

  // Collections
  getAllCollections(): SharedCollection[] {
    return Array.from(this.collections.values())
      .sort((a, b) => b.likes - a.likes);
  }

  getCollection(id: string): SharedCollection | undefined {
    return this.collections.get(id);
  }

  createCollection(collection: Omit<SharedCollection, 'id' | 'created' | 'lastModified' | 'likes' | 'followers'>): SharedCollection {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to create collections');
    }

    const id = `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newCollection: SharedCollection = {
      ...collection,
      id,
      author: this.currentUser,
      likes: 0,
      followers: 0,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.collections.set(id, newCollection);
    return newCollection;
  }

  addToCollection(collectionId: string, resourceId: string): boolean {
    const collection = this.collections.get(collectionId);
    if (collection && !collection.resources.includes(resourceId)) {
      collection.resources.push(resourceId);
      collection.lastModified = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Export/Import
  exportProgress(userId: string): string | null {
    const progress = this.getUserProgress(userId);
    if (!progress) return null;
    
    return JSON.stringify(progress, null, 2);
  }

  importProgress(progressJson: string): LearningProgress | null {
    try {
      const progress = JSON.parse(progressJson) as LearningProgress;
      this.learningProgress.set(progress.userId, progress);
      localStorage.setItem('fhir-learning-progress', progressJson);
      return progress;
    } catch (error) {
      console.error('Failed to import progress:', error);
      return null;
    }
  }
}

// Singleton instance
export const collaborationManager = new CollaborationManager();