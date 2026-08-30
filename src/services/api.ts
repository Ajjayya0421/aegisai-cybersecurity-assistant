import { ChatMessage, SecurityAnalysisResult } from '../types';

export interface ChatResponse {
  reply: string;
  timestamp: number;
}

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationHistory,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  return response.json();
}

export async function runSecurityAnalysis(
  category: 'message' | 'url' | 'log' | 'question',
  rawInput: string
): Promise<SecurityAnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category,
      rawInput,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
  }

  return response.json();
}

export async function checkServerHealth(): Promise<{
  status: string;
  geminiConfigured: boolean;
  service: string;
}> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  } catch (err: any) {
    return {
      status: 'offline',
      geminiConfigured: false,
      service: 'AegisAI Server Offline',
    };
  }
}
