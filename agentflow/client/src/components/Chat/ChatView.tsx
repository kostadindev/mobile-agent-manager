import { useEffect, useRef, useState, useCallback } from 'react';
import { Navbar, Messages, Message, Block, List, ListItem, Link } from 'konsta/react';
import { useStore } from '../../state/store';
import { Sparkles, ArrowUp, BookOpen, Lightbulb, Globe, Loader2, Settings, Volume2, VolumeX, Mic, Camera, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import TaskPlanCard from '../TaskPlan/TaskPlanCard';
import ExecutionGraph from '../Graph/ExecutionGraph';
import ImagePreview from './ImagePreview';
import VoiceButton from '../Voice/VoiceButton';
import ImageCapture from '../Camera/ImageCapture';

const suggestions = [
  { text: 'Summarize recent papers on LLM reasoning', icon: BookOpen, color: '#A855F7' },
  { text: 'Draft a research proposal on multimodal AI', icon: Lightbulb, color: '#F97316' },
  { text: 'Research background on transformer architectures', icon: Globe, color: '#06B6D4' },
];

export default function ChatView() {
  const { messages, isLoading, sendChat, isExecuting, imagePreview, transparencyLevel, setShowSettings, startNewConversation } = useStore();
  const [text, setText] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => { speechSynthesis.cancel(); };
  }, []);

  const handleSpeak = useCallback((msgId: string, content: string) => {
    if (speakingMsgId === msgId) {
      speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onend = () => setSpeakingMsgId(null);
      speechSynthesis.speak(utterance);
      setSpeakingMsgId(msgId);
    }
  }, [speakingMsgId]);

  const handleSend = useCallback(async () => {
    const msg = text.trim();
    if (!msg && !imagePreview) return;
    let imageBase64: string | undefined;
    let modality = 'text';
    if (imagePreview) {
      imageBase64 = imagePreview.split(',')[1];
      modality = 'image';
    }
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendChat(msg || 'Analyze this image', imageBase64, modality);
  }, [text, imagePreview, sendChat]);

  const handleAudioRecorded = useCallback(
    (audioBase64: string) => { sendChat('', undefined, 'voice', audioBase64); },
    [sendChat]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, []);

  const disabled = isLoading || isExecuting;
  const canSend = !disabled && (text.trim() || imagePreview);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-ios-dark-surface">
      {/* Navbar */}
      <Navbar
        title="AgentFlow"
        subtitle="AI Agent Orchestrator"
        right={
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Link onClick={startNewConversation} navbar>
                <Trash2 className="w-5 h-5 text-slate-400" aria-label="Clear chat" />
              </Link>
            )}
            <Link onClick={() => setShowSettings(true)} navbar>
              <Settings className="w-5 h-5 text-slate-400" aria-label="Settings" />
            </Link>
          </div>
        }
      />

      {/* Scrollable content area */}
      <div ref={scrollRef} className="h-0 grow overflow-y-auto">
        {messages.length === 0 ? (
          <>
            <Block className="text-center mt-12 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c6aef] to-[#a855f7] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-1">AgentFlow</h2>
              <p className="text-sm opacity-50">
                Orchestrate AI agents to handle your tasks. Just describe what you need.
              </p>
            </Block>

            <List strong inset outline>
              {suggestions.map(({ text: suggestion, icon: Icon, color }) => (
                <ListItem
                  key={suggestion}
                  title={suggestion}
                  media={<Icon className="w-5 h-5" style={{ color }} />}
                  link
                  onClick={() => sendChat(suggestion)}
                />
              ))}
            </List>
          </>
        ) : (
          <Messages>
            {messages.map((msg) => (
              <Message
                key={msg.id}
                type={msg.role === 'user' ? 'sent' : 'received'}
                name={msg.role === 'user' ? undefined : 'AgentFlow'}
                text={
                  <div>
                    {/* Modality badge (F6) */}
                    {msg.role === 'user' && msg.inputModality === 'voice' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5 mb-1">
                        <Mic className="w-3 h-3" /> Voice
                      </span>
                    )}
                    {msg.role === 'user' && msg.inputModality === 'image' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400 bg-cyan-400/10 rounded-full px-2 py-0.5 mb-1">
                        <Camera className="w-3 h-3" /> Image
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
                        hr: () => <hr className="my-2 border-white/10" />,
                        ul: ({ children }) => <ul className="list-disc ml-4 mt-1 text-sm">{children}</ul>,
                        li: ({ children }) => <li className="mt-0.5">{children}</li>,
                        a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 underline">{children}</a>,
                      }}
                    >
                      {msg.content}
                    </Markdown>

                    {/* TTS button for assistant messages (F4) */}
                    {msg.role === 'assistant' && msg.content && (
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className="mt-1.5 p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
                        aria-label={speakingMsgId === msg.id ? 'Stop reading' : 'Read aloud'}
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-[#7c6aef]" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    )}

                    {/* Task plan: hide in black_box mode */}
                    {msg.taskPlan && transparencyLevel !== 'black_box' && (
                      <div className="mt-3">
                        <TaskPlanCard plan={msg.taskPlan} />
                      </div>
                    )}

                    {/* Execution graph: only show in full_transparency */}
                    {msg.executionGraph && transparencyLevel === 'full_transparency' && (
                      <div className="mt-3 min-w-[260px]">
                        <ExecutionGraph compact />
                      </div>
                    )}
                  </div>
                }
                textFooter={
                  new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              />
            ))}
            {isLoading && (
              <Message
                type="received"
                name="AgentFlow"
                text={
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                }
              />
            )}
            {/* Spinner while executing in plan_preview mode */}
            {isExecuting && transparencyLevel === 'plan_preview' && (
              <Message
                type="received"
                name="AgentFlow"
                text={
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#7c6aef]" />
                    Agents working...
                  </div>
                }
              />
            )}
          </Messages>
        )}
      </div>

      {/* Image preview */}
      <ImagePreview />

      {/* Input bar */}
      <div className="flex-shrink-0 flex items-end gap-2 px-3 py-2 bg-ios-dark-surface-1 border-t border-white/[0.08]">
        <ImageCapture />
        <VoiceButton onAudioRecorded={handleAudioRecorded} />

        <div className="flex-1 bg-ios-dark-surface-2 rounded-2xl px-3 py-2 border border-white/[0.06]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Message..."
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-[15px] text-white placeholder-white/30 resize-none outline-none max-h-[120px] leading-relaxed"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            canSend ? 'bg-primary text-white' : 'text-white/20'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
}
