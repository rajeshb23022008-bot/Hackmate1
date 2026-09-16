import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../../components/ui/PageTransition';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeUserConversations,
  subscribeUserTeams,
  subscribeChatMessages,
  sendChatMessage,
  getOrCreateConversation,
  getTeammates,
  type Conversation,
  type Team,
  type ChatMessage,
} from '../../services/firestoreService';
import { ChatMessageItem } from '../../components/chat/ChatMessageItem';
import { TeamMemberListModal } from '../../components/chat/TeamMemberListModal';
import {
  MessageSquare,
  Users,
  Send,
  ArrowLeft,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';

export default function MessagesPage() {
  const { currentUser, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dms' | 'teams'>('dms');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Mobile navigation state
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user's conversations and teams
  useEffect(() => {
    if (!currentUser) return;

    const unsubConvs = subscribeUserConversations(currentUser.uid, (data) => {
      setConversations(data);
    });

    const unsubTeams = subscribeUserTeams(currentUser.uid, (data) => {
      setUserTeams(data);
    });

    return () => {
      unsubConvs();
      unsubTeams();
    };
  }, [currentUser]);

  // Handle URL query parameters (e.g., ?recipientId=xxx or ?chatId=yyy)
  useEffect(() => {
    const recipientId = searchParams.get('recipientId');
    const chatId = searchParams.get('chatId');

    if (chatId) {
      setSelectedChatId(chatId);
      setShowMobileChat(true);
      if (chatId.includes('_')) {
        setActiveTab('dms');
      } else {
        setActiveTab('teams');
      }
    } else if (recipientId && currentUser) {
      const initDM = async () => {
        try {
          const allUsers = await getTeammates();
          const recipient = allUsers.find((u) => u.uid === recipientId);
          if (recipient) {
            const convId = await getOrCreateConversation(
              {
                uid: currentUser.uid,
                displayName: userProfile?.displayName || currentUser.displayName || 'Hacker',
                email: currentUser.email || '',
                role: userProfile?.role || 'Member',
              },
              {
                uid: recipient.uid,
                displayName: recipient.displayName || 'Hacker',
                email: recipient.email || '',
                role: recipient.role || 'Member',
              }
            );
            setSelectedChatId(convId);
            setActiveTab('dms');
            setShowMobileChat(true);
          }
        } catch (err) {
          console.error('Error initializing DM from URL:', err);
        }
      };
      initDM();
    }
  }, [searchParams, currentUser, userProfile]);

  // Subscribe to real-time chat messages when selectedChatId changes
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const unsubMessages = subscribeChatMessages(selectedChatId, (data) => {
      setMessages(data);
    });

    return () => unsubMessages();
  }, [selectedChatId]);

  // Handle sending a text message
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedChatId || !currentUser) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendChatMessage({
        chatId: selectedChatId,
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName || 'Hacker',
        text,
        type: 'text',
      });
    } catch (err) {
      console.error('Error sending text message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Find active chat target details
  const activeConversation = conversations.find((c) => c.id === selectedChatId);
  const activeTeam = userTeams.find((t) => t.id === selectedChatId);

  const otherUserKey = activeConversation?.participants.find((p) => p !== currentUser?.uid);
  const otherUserData = otherUserKey ? activeConversation?.participantData?.[otherUserKey] : null;

  const chatTitle = activeTeam
    ? activeTeam.name
    : otherUserData?.displayName || 'Direct Message';
  const chatSubtitle = activeTeam
    ? `${activeTeam.members?.length || 1} team members`
    : otherUserData?.role || 'Hackmate User';

  // Filter conversations/teams for search
  const filteredConvs = conversations.filter((c) => {
    const otherKey = c.participants.find((p) => p !== currentUser?.uid);
    const data = otherKey ? c.participantData?.[otherKey] : null;
    return (
      !searchFilter ||
      (data?.displayName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.lastMessage?.text || '').toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  const filteredTeams = userTeams.filter(
    (t) =>
      !searchFilter ||
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.hackathon.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <PageTransition className="max-w-7xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Container Box */}
      <div className="bg-navy-800/90 border border-navy-700/80 rounded-2xl flex-1 flex overflow-hidden shadow-2xl">
        {/* LEFT SIDEBAR / INBOX LIST */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-navy-700/80 flex flex-col bg-navy-900/60 ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Bar & Search */}
          <div className="p-4 border-b border-navy-700/80 space-y-3">
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-accent" />
              <span>Messages</span>
            </h1>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats or teammates..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2 pl-9 pr-3 text-white text-xs focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Tab Switcher: Direct Messages vs Team Group Chats */}
            <div className="grid grid-cols-2 p-1 bg-navy-900 border border-navy-700 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('dms')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'dms'
                    ? 'bg-blue-accent text-navy-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct ({conversations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('teams')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'teams'
                    ? 'bg-blue-accent text-navy-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Teams ({userTeams.length})</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeTab === 'dms' ? (
              filteredConvs.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">No direct conversations yet.</p>
                  <button
                    onClick={() => navigate('/app/teammates')}
                    className="text-xs font-bold text-blue-accent hover:underline cursor-pointer"
                  >
                    Find teammates to message
                  </button>
                </div>
              ) : (
                filteredConvs.map((conv) => {
                  const otherUid = conv.participants.find((p) => p !== currentUser?.uid);
                  const pData = otherUid ? conv.participantData?.[otherUid] : null;
                  const isSelected = selectedChatId === conv.id;
                  const initial = pData?.displayName ? pData.displayName.charAt(0).toUpperCase() : '?';

                  return (
                    <motion.div
                      key={conv.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedChatId(conv.id);
                        setShowMobileChat(true);
                      }}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-blue-accent/10 border-blue-accent/40 shadow-sm'
                          : 'bg-navy-900/40 border-navy-700/50 hover:bg-navy-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-accent to-blue-600 flex items-center justify-center text-navy-900 font-bold text-sm shrink-0">
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white truncate">
                              {pData?.displayName || 'Hacker'}
                            </span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {conv.updatedAt?.toMillis
                                ? new Date(conv.updatedAt.toMillis()).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {conv.lastMessage?.text || 'Started a conversation'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )
            ) : filteredTeams.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-slate-400">You are not a member of any team yet.</p>
                <button
                  onClick={() => navigate('/app/teams')}
                  className="text-xs font-bold text-blue-accent hover:underline cursor-pointer"
                >
                  Join a team
                </button>
              </div>
            ) : (
              filteredTeams.map((team) => {
                const isSelected = selectedChatId === team.id;
                const initial = team.name ? team.name.charAt(0).toUpperCase() : 'T';

                return (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      if (team.id) {
                        setSelectedChatId(team.id);
                        setShowMobileChat(true);
                      }
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-accent/10 border-blue-accent/40 shadow-sm'
                        : 'bg-navy-900/40 border-navy-700/50 hover:bg-navy-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-navy-950 font-bold text-sm shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white truncate">{team.name}</span>
                          <span className="text-[10px] bg-navy-700 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                            {team.members?.length || 1} members
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {team.problemStatement || team.hackathon || 'Team Group Chat'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div
          className={`flex-1 flex flex-col bg-navy-900/90 ${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-navy-700/80 flex items-center justify-between bg-navy-800/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-accent to-blue-600 flex items-center justify-center text-navy-900 font-bold text-sm shadow-sm shrink-0">
                    {chatTitle.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-white leading-tight flex items-center gap-2">
                      {chatTitle}
                    </h2>
                    <p className="text-xs text-slate-400">{chatSubtitle}</p>
                  </div>
                </div>

                {/* Info Button for Teams */}
                {activeTeam && (
                  <button
                    onClick={() => setIsMembersModalOpen(true)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-navy-700 transition-colors flex items-center gap-1.5 text-xs font-bold border border-navy-700 cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-blue-accent" />
                    <span className="hidden sm:inline">Members ({activeTeam.members?.length})</span>
                  </button>
                )}
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">No messages yet</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Say hello or send a voice message to kick off the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <ChatMessageItem
                      key={msg.id || Math.random().toString()}
                      message={msg}
                      isSelf={msg.senderId === currentUser?.uid}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t border-navy-700/80 bg-navy-800/80">
                <form onSubmit={handleSendText} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isSending}
                    className="flex-1 bg-navy-900 border border-navy-700 rounded-xl py-2.5 px-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2.5 bg-blue-accent text-navy-950 font-bold rounded-xl hover:bg-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Select a conversation</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Choose a direct message or team group chat from the list on the left to start messaging in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Member List Modal */}
      {activeTeam && (
        <TeamMemberListModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          teamName={activeTeam.name}
          members={activeTeam.members || []}
          currentUserId={currentUser?.uid}
          onStartDM={async (member) => {
            if (!currentUser) return;
            try {
              const convId = await getOrCreateConversation(
                {
                  uid: currentUser.uid,
                  displayName: userProfile?.displayName || currentUser.displayName || 'Hacker',
                  email: currentUser.email || '',
                  role: userProfile?.role || 'Member',
                },
                {
                  uid: member.uid,
                  displayName: member.name,
                  email: member.email || '',
                  role: member.role || 'Member',
                }
              );
              setSelectedChatId(convId);
              setActiveTab('dms');
              setShowMobileChat(true);
            } catch (err) {
              console.error('Error starting DM with member:', err);
            }
          }}
        />
      )}
    </PageTransition>
  );
}
