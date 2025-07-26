'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Share2, 
  Copy, 
  Plus, 
  Settings,
  Eye,
  Edit,
  Crown,
  Circle,
  Send,
  Smile,
  Download,
  Upload,
  Clock
} from 'lucide-react';
import { 
  collaborationManager, 
  CollaborationRoom, 
  Participant, 
  ChatMessage, 
  CollaborationEvent 
} from '@/lib/collaboration';
import { useI18n } from '@/contexts/I18nContext';

export default function CollaboratePage() {
  const router = useRouter();
  const { t, formatRelativeTime } = useI18n();
  const [currentRoom, setCurrentRoom] = useState<CollaborationRoom | null>(null);
  const [availableRooms, setAvailableRooms] = useState<CollaborationRoom[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'chat'>('content');
  const [currentUser] = useState<Participant>({
    id: 'user-current',
    name: 'You',
    role: 'editor',
    status: 'online',
    lastSeen: new Date().toISOString(),
    joinedAt: new Date().toISOString()
  });
  const [chatMessage, setChatMessage] = useState('');
  const [sharedContent, setSharedContent] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load available rooms
    setAvailableRooms(collaborationManager.getAllRooms());
    
    // Set current user
    collaborationManager.setCurrentUser(currentUser);
  }, []);

  useEffect(() => {
    if (currentRoom) {
      // Set up event listener for real-time updates
      const handleEvent = (event: CollaborationEvent) => {
        switch (event.type) {
          case 'user-joined':
          case 'user-left':
          case 'content-changed':
          case 'chat-message':
            // Refresh room data
            const updatedRoom = collaborationManager.getRoom(currentRoom.id);
            if (updatedRoom) {
              setCurrentRoom(updatedRoom);
              if (event.type === 'content-changed') {
                setSharedContent(JSON.stringify(updatedRoom.content.data, null, 2));
              }
            }
            break;
        }
      };

      collaborationManager.addEventListener(currentRoom.id, handleEvent);
      
      // Initialize shared content
      setSharedContent(JSON.stringify(currentRoom.content.data, null, 2));

      return () => {
        collaborationManager.removeEventListener(currentRoom.id, handleEvent);
      };
    }
  }, [currentRoom]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentRoom?.chat]);

  const joinRoom = (room: CollaborationRoom) => {
    const success = collaborationManager.joinRoom(room.id, currentUser);
    if (success) {
      setCurrentRoom(collaborationManager.getRoom(room.id));
    }
  };

  const leaveRoom = () => {
    if (currentRoom) {
      collaborationManager.leaveRoom(currentRoom.id, currentUser.id);
      setCurrentRoom(null);
      setSharedContent('');
    }
  };

  const createRoom = (name: string, description: string) => {
    const newRoom = collaborationManager.createRoom(name, description);
    collaborationManager.joinRoom(newRoom.id, { ...currentUser, role: 'owner' });
    setCurrentRoom(collaborationManager.getRoom(newRoom.id));
    setAvailableRooms(collaborationManager.getAllRooms());
    setShowCreateRoom(false);
  };

  const updateContent = (newContent: string) => {
    if (!currentRoom) return;

    setSharedContent(newContent);
    
    // Simulate debounced updates
    const change = {
      id: 'change-' + Date.now(),
      type: 'replace' as const,
      position: { line: 0, column: 0 },
      content: newContent,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name
    };

    collaborationManager.updateContent(currentRoom.id, currentUser.id, [change]);
  };

  const sendMessage = () => {
    if (!currentRoom || !chatMessage.trim()) return;

    collaborationManager.sendChatMessage(currentRoom.id, currentUser.id, chatMessage);
    setChatMessage('');
  };

  const shareRoom = () => {
    if (!currentRoom) return;
    
    const shareUrl = `${window.location.origin}/collaborate?room=${currentRoom.id}`;
    navigator.clipboard.writeText(shareUrl);
    // You could show a toast notification here
  };

  const getStatusIndicator = (status: Participant['status']) => {
    const colors = {
      online: 'text-green-500',
      away: 'text-yellow-500',
      offline: 'text-gray-400'
    };
    return <Circle className={`h-2 w-2 fill-current ${colors[status]}`} />;
  };

  const getRoleIcon = (role: Participant['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'editor':
        return <Edit className="h-3 w-3 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-3 w-3 text-gray-500" />;
    }
  };

  if (!currentRoom) {
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
                  {t('common.back')}
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('collaboration.title')}</h1>
                  <p className="text-gray-600 mt-1">{t('collaboration.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowJoinRoom(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t('collaboration.joinRoom')}
                </button>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('collaboration.createRoom')}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Available Rooms */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map(room => (
                <div key={room.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{room.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{room.participants.length} {t('collaboration.participants')}</span>
                      <span>{formatRelativeTime(new Date(room.lastActive))}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      {room.participants.slice(0, 3).map(participant => (
                        <div key={participant.id} className="flex items-center space-x-1">
                          {getStatusIndicator(participant.status)}
                          <span className="text-xs text-gray-600">{participant.name}</span>
                        </div>
                      ))}
                      {room.participants.length > 3 && (
                        <span className="text-xs text-gray-500">+{room.participants.length - 3} more</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => joinRoom(room)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Room Modal */}
          {showCreateRoom && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('collaboration.createRoom')}</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  createRoom(
                    formData.get('name') as string,
                    formData.get('description') as string
                  );
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter room name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe what you'll be working on..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateRoom(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('common.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={leaveRoom}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('collaboration.leaveRoom')}
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentRoom.name}</h1>
                <p className="text-sm text-gray-600">{currentRoom.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {currentRoom.participants.filter(p => p.status === 'online').length} {t('collaboration.onlineUsers')}
                </span>
              </div>
              <button
                onClick={shareRoom}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t('collaboration.shareRoom')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'content'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('collaboration.liveEditing')}
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'chat'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('collaboration.chatMessages')}
                  {currentRoom.chat.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {currentRoom.chat.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'content' ? (
              <div className="p-6 h-full">
                <div className="bg-white rounded-lg shadow h-full flex flex-col">
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900">Shared FHIR Resource</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Version {currentRoom.content.version} • Last modified by {
                        currentRoom.participants.find(p => p.id === currentRoom.content.lastModifiedBy)?.name || 'Unknown'
                      }
                    </p>
                  </div>
                  <div className="flex-1 p-4">
                    <textarea
                      value={sharedContent}
                      onChange={(e) => updateContent(e.target.value)}
                      className="w-full h-full font-mono text-sm border border-gray-300 rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Start editing the shared FHIR resource..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {currentRoom.chat.map(message => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {message.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{message.userName}</span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(new Date(message.timestamp))}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder={t('collaboration.sendMessage')}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!chatMessage.trim()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants Sidebar */}
        <div className="w-64 bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{t('collaboration.participants')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentRoom.participants.length} total
            </p>
          </div>
          <div className="p-4 space-y-3">
            {currentRoom.participants.map(participant => (
              <div key={participant.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {participant.name}
                    </span>
                    {getRoleIcon(participant.role)}
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIndicator(participant.status)}
                    <span className="text-xs text-gray-500 capitalize">{participant.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}