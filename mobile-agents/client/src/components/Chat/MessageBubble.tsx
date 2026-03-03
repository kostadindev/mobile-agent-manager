// Chat messages now rendered via Konsta's <Message> in ChatView.tsx
// This file kept for backward compatibility
import type { ChatMessage } from '../../types/messages';

export default function MessageBubble({ message: _message }: { message: ChatMessage }) {
  return null;
}
