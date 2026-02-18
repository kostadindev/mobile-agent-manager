export type TranslationKey =
  // App
  | 'app.title'
  | 'app.subtitle'
  | 'app.tagline'
  // Tabs
  | 'tab.chat'
  | 'tab.agents'
  | 'tab.history'
  // Chat
  | 'chat.placeholder'
  | 'chat.analyzeImage'
  | 'chat.agentsWorking'
  | 'chat.voiceBadge'
  | 'chat.imageBadge'
  // Suggestions
  | 'suggestion.research'
  | 'suggestion.proposal'
  | 'suggestion.transformer'
  // Settings
  | 'settings.transparencyMode'
  | 'settings.blackBox'
  | 'settings.blackBoxDesc'
  | 'settings.planPreview'
  | 'settings.planPreviewDesc'
  | 'settings.fullTransparency'
  | 'settings.fullTransparencyDesc'
  | 'settings.inputMode'
  | 'settings.multimodal'
  | 'settings.multimodalDesc'
  | 'settings.textImages'
  | 'settings.textImagesDesc'
  | 'settings.voiceOnly'
  | 'settings.voiceOnlyDesc'
  | 'settings.theme'
  | 'settings.dark'
  | 'settings.darkDesc'
  | 'settings.light'
  | 'settings.lightDesc'
  | 'settings.auto'
  | 'settings.autoDesc'
  | 'settings.language'
  | 'settings.clearHistory'
  // Agents
  | 'agents.title'
  | 'agents.subtitle'
  | 'agents.noAgents'
  | 'agents.orchestrator'
  | 'agents.alwaysActive'
  | 'agents.agents'
  | 'agents.nTools'
  // Agent Detail
  | 'agentDetail.goal'
  | 'agentDetail.tools'
  | 'agentDetail.systemPrompt'
  | 'agentDetail.noSystemPrompt'
  | 'agentDetail.constitution'
  | 'agentDetail.constitutionDesc'
  | 'agentDetail.constitutionPlaceholder'
  | 'agentDetail.save'
  // Agent Form
  | 'agentForm.editAgent'
  | 'agentForm.newAgent'
  | 'agentForm.name'
  | 'agentForm.namePlaceholder'
  | 'agentForm.description'
  | 'agentForm.descriptionPlaceholder'
  | 'agentForm.role'
  | 'agentForm.rolePlaceholder'
  | 'agentForm.goal'
  | 'agentForm.goalPlaceholder'
  | 'agentForm.icon'
  | 'agentForm.color'
  | 'agentForm.update'
  | 'agentForm.create'
  // Task Plan
  | 'taskPlan.title'
  | 'taskPlan.proposed'
  | 'taskPlan.executing'
  | 'taskPlan.completed'
  | 'taskPlan.failed'
  // Approval
  | 'approval.execute'
  | 'approval.cancel'
  // Execution Graph
  | 'graph.title'
  | 'graph.planReady'
  | 'graph.executing'
  | 'graph.completed'
  | 'graph.failed'
  // Graph Legend
  | 'legend.pending'
  | 'legend.running'
  | 'legend.complete'
  | 'legend.approval'
  | 'legend.failed'
  // Graph Nodes
  | 'node.output'
  | 'node.allComplete'
  | 'node.waiting'
  | 'node.orchestrator'
  | 'node.checkpoint'
  // History
  | 'history.title'
  | 'history.subtitle'
  | 'history.noConversations'
  | 'history.noConversationsHint'
  | 'history.nMessages'
  // Privacy
  | 'privacy.title'
  | 'privacy.description'
  | 'privacy.cancel'
  | 'privacy.continue'
  // Voice
  | 'voice.micDenied'
  // Messages (store)
  | 'msg.voiceMessage'
  | 'msg.imageSent'
  | 'msg.processing'
  | 'msg.error'
  | 'msg.allCompleted'
  | 'msg.executionFailed';

export type Translations = Record<TranslationKey, string>;

const en: Translations = {
  // App
  'app.title': 'AgentFlow',
  'app.subtitle': 'Your AI Workforce',
  'app.tagline': 'Your personal AI workforce. Describe any task and let intelligent agents do the heavy lifting.',

  // Tabs
  'tab.chat': 'Chat',
  'tab.agents': 'Agents',
  'tab.history': 'History',

  // Chat
  'chat.placeholder': 'Message...',
  'chat.analyzeImage': 'Analyze this image',
  'chat.agentsWorking': 'Agents working...',
  'chat.voiceBadge': 'Voice',
  'chat.imageBadge': 'Image',

  // Suggestions
  'suggestion.research': 'Summarize the latest research on LLM reasoning',
  'suggestion.proposal': 'Help me draft a proposal for a multimodal AI project',
  'suggestion.transformer': 'Break down how transformer architectures work',

  // Settings
  'settings.transparencyMode': 'Transparency Mode',
  'settings.blackBox': 'Black Box',
  'settings.blackBoxDesc': 'Agents execute automatically — only the final answer is shown.',
  'settings.planPreview': 'Plan Preview',
  'settings.planPreviewDesc': 'See the task plan before execution, but no live graph.',
  'settings.fullTransparency': 'Full Transparency',
  'settings.fullTransparencyDesc': 'See the task plan and live execution graph.',
  'settings.inputMode': 'Input Mode',
  'settings.multimodal': 'Multimodal',
  'settings.multimodalDesc': 'Text, images, and voice input.',
  'settings.textImages': 'Text + Images',
  'settings.textImagesDesc': 'Text and image input only — no voice.',
  'settings.voiceOnly': 'Voice Only',
  'settings.voiceOnlyDesc': 'Voice input only — no text or images.',
  'settings.theme': 'Theme',
  'settings.dark': 'Dark',
  'settings.darkDesc': 'Always use dark theme.',
  'settings.light': 'Light',
  'settings.lightDesc': 'Always use light theme.',
  'settings.auto': 'Auto',
  'settings.autoDesc': 'Follow your system preference.',
  'settings.language': 'Language',
  'settings.clearHistory': 'Clear History',

  // Agents
  'agents.title': 'Agents',
  'agents.subtitle': 'Assembled dynamically for each task',
  'agents.noAgents': 'No agents configured',
  'agents.orchestrator': 'Orchestrator',
  'agents.alwaysActive': 'Always active',
  'agents.agents': 'Agents',
  'agents.nTools': '{count} tools',

  // Agent Detail
  'agentDetail.goal': 'Goal',
  'agentDetail.tools': 'Tools',
  'agentDetail.systemPrompt': 'System Prompt',
  'agentDetail.noSystemPrompt': 'No system prompt configured.',
  'agentDetail.constitution': 'Constitution',
  'agentDetail.constitutionDesc': "Custom guidelines appended to the orchestrator's system prompt.",
  'agentDetail.constitutionPlaceholder': 'e.g. Always prefer arXiv over Wikipedia. Keep plans under 3 steps...',
  'agentDetail.save': 'Save',

  // Agent Form
  'agentForm.editAgent': 'Edit Agent',
  'agentForm.newAgent': 'New Agent',
  'agentForm.name': 'Name',
  'agentForm.namePlaceholder': 'Agent name',
  'agentForm.description': 'Description',
  'agentForm.descriptionPlaceholder': 'What does this agent do?',
  'agentForm.role': 'Role',
  'agentForm.rolePlaceholder': 'e.g. Research Analyst',
  'agentForm.goal': 'Goal',
  'agentForm.goalPlaceholder': "Agent's goal",
  'agentForm.icon': 'Icon',
  'agentForm.color': 'Color',
  'agentForm.update': 'Update',
  'agentForm.create': 'Create',

  // Task Plan
  'taskPlan.title': 'Task Plan',
  'taskPlan.proposed': 'Proposed',
  'taskPlan.executing': 'Executing',
  'taskPlan.completed': 'Completed',
  'taskPlan.failed': 'Failed',

  // Approval
  'approval.execute': 'Execute',
  'approval.cancel': 'Cancel',

  // Execution Graph
  'graph.title': 'Execution Graph',
  'graph.planReady': 'Plan Ready',
  'graph.executing': 'Executing...',
  'graph.completed': 'Completed',
  'graph.failed': 'Failed',

  // Graph Legend
  'legend.pending': 'Pending',
  'legend.running': 'Running',
  'legend.complete': 'Complete',
  'legend.approval': 'Approval',
  'legend.failed': 'Failed',

  // Graph Nodes
  'node.output': 'Output',
  'node.allComplete': 'All Complete',
  'node.waiting': 'Waiting...',
  'node.orchestrator': 'Orchestrator',
  'node.checkpoint': 'Checkpoint',

  // History
  'history.title': 'History',
  'history.subtitle': 'Past conversations',
  'history.noConversations': 'No past conversations',
  'history.noConversationsHint': 'Cleared or new chats will appear here',
  'history.nMessages': '{count} messages',

  // Privacy
  'privacy.title': 'Privacy Notice',
  'privacy.description': 'Voice and image data will be sent to OpenAI for processing. No data is stored permanently on our servers. By continuing, you consent to this processing.',
  'privacy.cancel': 'Cancel',
  'privacy.continue': 'Continue',

  // Voice
  'voice.micDenied': 'Microphone access denied.',

  // Messages (store)
  'msg.voiceMessage': 'Voice message',
  'msg.imageSent': 'Image sent',
  'msg.processing': 'Processing your request...',
  'msg.error': 'Sorry, something went wrong. Please check that the server is running.',
  'msg.allCompleted': 'All tasks completed successfully!',
  'msg.executionFailed': 'Execution failed. Please check the server connection.',
};

export default en;
