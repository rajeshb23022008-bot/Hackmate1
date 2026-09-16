import React from 'react';
import type { ChatMessage } from '../../services/firestoreService';

interface ChatMessageItemProps {
  message: ChatMessage;
  isSelf: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isSelf }) => {
  const formatTimestamp = (ts: any) => {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Helper to parse text and turn URLs into clickable links
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline font-medium hover:text-white break-all transition-colors"
          >
            {part}
          </a>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const initial = message.senderName ? message.senderName.charAt(0).toUpperCase() : '?';

  return (
    <div className={`flex gap-3 my-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
          isSelf
            ? 'bg-gradient-to-tr from-blue-accent to-blue-600 text-navy-900'
            : 'bg-navy-700 text-slate-200 border border-navy-600'
        }`}
      >
        {initial}
      </div>

      {/* Bubble Content */}
      <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${isSelf ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-bold text-slate-300">{message.senderName}</span>
          <span className="text-[10px] text-slate-500">{formatTimestamp(message.createdAt)}</span>
        </div>

        {/* Message Body */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isSelf
              ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
              : 'bg-navy-800 border border-navy-700/80 text-slate-200 rounded-tl-none shadow-sm'
          }`}
        >
          {renderFormattedText(message.text || '')}
        </div>
      </div>
    </div>
  );
};
