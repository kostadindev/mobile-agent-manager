import { Navbar, Block, Link } from 'konsta/react';
import { useStore } from '../../state/store';
import { useT } from '../../i18n';
import { Clock, ChevronLeft, Trash2, MessageSquare, Mic, Camera } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ExecutionView() {
  const {
    conversations,
    viewingConversation,
    setViewingConversation,
    openConversation,
    deleteConversation,
    clearAllHistory,
  } = useStore();
  const t = useT();

  // Detail view: show a single conversation read-only
  if (viewingConversation) {
    return (
      <div className="h-full flex flex-col bg-surface">
        <Navbar
          title={viewingConversation.title}
          left={
            <Link onClick={() => setViewingConversation(null)} navbar>
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
          }
        />
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
          {viewingConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-surface-1 text-on-surface-secondary rounded-bl-md'
                }`}
              >
                {/* Modality badge */}
                {msg.role === 'user' && msg.inputModality === 'voice' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5 mb-1">
                    <Mic className="w-3 h-3" /> {t('chat.voiceBadge')}
                  </span>
                )}
                {msg.role === 'user' && msg.inputModality === 'image' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400 bg-cyan-400/10 rounded-full px-2 py-0.5 mb-1">
                    <Camera className="w-3 h-3" /> {t('chat.imageBadge')}
                  </span>
                )}

                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached" className="rounded-lg max-w-[200px] mb-2" />
                )}
                <Markdown
                  components={{
                    h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1">{children}</h3>,
                    h2: ({ children }) => <h2 className="text-base font-bold mt-4 mb-1">{children}</h2>,
                    p: ({ children }) => <p className="mt-1 text-sm">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    hr: () => <hr className="my-2 border-border" />,
                    ul: ({ children }) => <ul className="list-disc ms-4 mt-1 text-sm">{children}</ul>,
                    li: ({ children }) => <li className="mt-0.5">{children}</li>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </Markdown>
                <p className="text-[10px] opacity-40 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List view: show all archived conversations
  return (
    <div className="h-full flex flex-col bg-surface">
      <Navbar
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        right={
          conversations.length > 0 ? (
            <Link onClick={clearAllHistory} navbar>
              <Trash2 className="w-5 h-5 text-red-400" aria-label="Clear all history" />
            </Link>
          ) : undefined
        }
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        {conversations.length === 0 ? (
          <Block className="text-center mt-24">
            <div className="w-14 h-14 rounded-2xl bg-surface-1 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 opacity-30" />
            </div>
            <p className="text-base opacity-50">{t('history.noConversations')}</p>
            <p className="text-sm opacity-30 mt-1">{t('history.noConversationsHint')}</p>
          </Block>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-3 px-4 py-3 active:bg-hover transition-colors"
              >
                <button
                  className="flex-1 min-w-0 text-start"
                  onClick={() => openConversation(conv.id)}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <MessageSquare className="w-4 h-4 text-[#7c6aef] flex-shrink-0" />
                    <p className="text-sm font-medium text-on-surface truncate">{conv.title}</p>
                  </div>
                  <div className="flex items-center gap-2 ms-6">
                    <span className="text-xs opacity-40">
                      {new Date(conv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs opacity-30">
                      {t('history.nMessages', { count: String(conv.messages.length) })}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  className="p-2 rounded-lg hover:bg-hover transition-colors flex-shrink-0"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="w-4 h-4 text-red-400/60" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
