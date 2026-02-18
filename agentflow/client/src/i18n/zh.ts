import type { Translations } from './en';

const zh: Translations = {
  // App
  'app.title': 'AgentFlow',
  'app.subtitle': '你的 AI 团队',
  'app.tagline': '你的个人 AI 团队。描述任何任务，让智能代理帮你完成。',

  // Tabs
  'tab.chat': '聊天',
  'tab.agents': '代理',
  'tab.history': '历史',
  'tab.guide': '文档',

  // Chat
  'chat.placeholder': '输入消息...',
  'chat.analyzeImage': '分析这张图片',
  'chat.agentsWorking': '代理工作中...',
  'chat.voiceBadge': '语音',
  'chat.imageBadge': '图片',

  // Suggestions
  'suggestion.research': '总结关于大语言模型推理的最新研究',
  'suggestion.proposal': '帮我起草一个多模态 AI 项目提案',
  'suggestion.transformer': '讲解 Transformer 架构的工作原理',

  // Settings
  'settings.transparencyMode': '透明度模式',
  'settings.blackBox': '黑盒',
  'settings.blackBoxDesc': '代理自动执行——只显示最终结果。',
  'settings.planPreview': '计划预览',
  'settings.planPreviewDesc': '执行前查看任务计划，但没有实时图表。',
  'settings.fullTransparency': '完全透明',
  'settings.fullTransparencyDesc': '查看任务计划和实时执行图表。',
  'settings.inputMode': '输入模式',
  'settings.multimodal': '多模态',
  'settings.multimodalDesc': '文本、图片和语音输入。',
  'settings.textImages': '文本+图片',
  'settings.textImagesDesc': '仅文本和图片输入——无语音。',
  'settings.voiceOnly': '仅语音',
  'settings.voiceOnlyDesc': '仅语音输入——无文本或图片。',
  'settings.theme': '主题',
  'settings.dark': '深色',
  'settings.darkDesc': '始终使用深色主题。',
  'settings.light': '浅色',
  'settings.lightDesc': '始终使用浅色主题。',
  'settings.auto': '自动',
  'settings.autoDesc': '跟随系统设置。',
  'settings.language': '语言',
  'settings.clearHistory': '清除历史',

  // Agents
  'agents.title': '代理',
  'agents.subtitle': '为每个任务动态组建',
  'agents.noAgents': '未配置代理',
  'agents.orchestrator': '编排器',
  'agents.alwaysActive': '始终活跃',
  'agents.agents': '代理',
  'agents.nTools': '{count} 个工具',

  // Agent Detail
  'agentDetail.goal': '目标',
  'agentDetail.tools': '工具',
  'agentDetail.systemPrompt': '系统提示',
  'agentDetail.noSystemPrompt': '未配置系统提示。',
  'agentDetail.constitution': '准则',
  'agentDetail.constitutionDesc': '附加到编排器系统提示的自定义指南。',
  'agentDetail.constitutionPlaceholder': '例如：优先使用 arXiv 而非维基百科。计划不超过 3 步...',
  'agentDetail.save': '保存',

  // Agent Form
  'agentForm.editAgent': '编辑代理',
  'agentForm.newAgent': '新建代理',
  'agentForm.name': '名称',
  'agentForm.namePlaceholder': '代理名称',
  'agentForm.description': '描述',
  'agentForm.descriptionPlaceholder': '这个代理做什么？',
  'agentForm.role': '角色',
  'agentForm.rolePlaceholder': '例如：研究分析师',
  'agentForm.goal': '目标',
  'agentForm.goalPlaceholder': '代理的目标',
  'agentForm.icon': '图标',
  'agentForm.color': '颜色',
  'agentForm.update': '更新',
  'agentForm.create': '创建',

  // Task Plan
  'taskPlan.title': '任务计划',
  'taskPlan.proposed': '已提议',
  'taskPlan.executing': '执行中',
  'taskPlan.completed': '已完成',
  'taskPlan.failed': '失败',

  // Approval
  'approval.execute': '执行',
  'approval.cancel': '取消',

  // Execution Graph
  'graph.title': '执行图',
  'graph.planReady': '计划就绪',
  'graph.executing': '执行中...',
  'graph.completed': '已完成',
  'graph.failed': '失败',

  // Graph Legend
  'legend.pending': '等待中',
  'legend.running': '运行中',
  'legend.complete': '完成',
  'legend.approval': '待批准',
  'legend.failed': '失败',

  // Graph Nodes
  'node.output': '输出',
  'node.allComplete': '全部完成',
  'node.waiting': '等待中...',
  'node.orchestrator': '编排器',
  'node.checkpoint': '检查点',

  // History
  'history.title': '历史',
  'history.subtitle': '过往对话',
  'history.noConversations': '没有过往对话',
  'history.noConversationsHint': '清除或新建的聊天会显示在这里',
  'history.nMessages': '{count} 条消息',

  // Privacy
  'privacy.title': '隐私声明',
  'privacy.description': '语音和图片数据将发送至 OpenAI 进行处理。我们的服务器不会永久存储任何数据。继续即表示你同意此处理方式。',
  'privacy.cancel': '取消',
  'privacy.continue': '继续',

  // Voice
  'voice.micDenied': '麦克风访问被拒绝。',

  // Messages (store)
  'msg.voiceMessage': '语音消息',
  'msg.imageSent': '已发送图片',
  'msg.processing': '正在处理你的请求...',
  'msg.error': '出错了。请检查服务器是否运行。',
  'msg.allCompleted': '所有任务已成功完成！',
  'msg.executionFailed': '执行失败。请检查服务器连接。',

  // Guide
  'guide.title': '文档',
  'guide.subtitle': '了解如何使用 AgentFlow',
  'guide.gettingStarted': '快速入门',
  'guide.gettingStartedDesc': '在聊天标签中输入消息来描述任务。编排器会将其拆分为步骤并分配给专业代理。点击执行来运行计划。',
  'guide.inputModes': '输入模式',
  'guide.inputModesDesc': '多模态接受文本、图片和语音。文本+图片禁用语音。仅语音将输入限制为麦克风。在设置中更改模式。',
  'guide.transparencyModes': '透明度模式',
  'guide.transparencyModesDesc': '黑盒模式静默运行代理，只显示最终结果。计划预览在执行前显示任务计划。完全透明显示计划和实时执行图表。',
  'guide.agents': '代理',
  'guide.agentsDesc': '代理标签列出所有可用代理。编排器规划任务且始终活跃。工作代理可以启用/禁用。点击代理查看详情或编辑其准则。',
  'guide.executionGraph': '执行图',
  'guide.executionGraphDesc': '在完全透明模式下，有向无环图（DAG）可视化代理任务。节点代表步骤；边表示依赖关系。颜色指示状态：等待中、运行中、完成或失败。',
  'guide.history': '历史',
  'guide.historyDesc': '开始新聊天时，过往对话会自动保存。从历史标签浏览和重新打开。可以删除单个对话或从设置中清除所有历史。',
};

export default zh;
