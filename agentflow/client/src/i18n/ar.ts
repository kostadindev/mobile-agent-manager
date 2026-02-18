import type { Translations } from './en';

const ar: Translations = {
  // App
  'app.title': 'AgentFlow',
  'app.subtitle': 'فريق الذكاء الاصطناعي بتاعك',
  'app.tagline': 'فريق الذكاء الاصطناعي الشخصي بتاعك. اوصف أي مهمة وسيب الوكلاء الأذكياء يشتغلوا.',

  // Tabs
  'tab.chat': 'محادثة',
  'tab.agents': 'الوكلاء',
  'tab.history': 'السجل',
  'tab.guide': 'الدليل',

  // Chat
  'chat.placeholder': 'رسالة...',
  'chat.analyzeImage': 'حلل الصورة دي',
  'chat.agentsWorking': 'الوكلاء شغالين...',
  'chat.voiceBadge': 'صوت',
  'chat.imageBadge': 'صورة',

  // Suggestions
  'suggestion.research': 'لخص أحدث الأبحاث عن استدلال نماذج اللغة الكبيرة',
  'suggestion.proposal': 'ساعدني أكتب مقترح لمشروع ذكاء اصطناعي متعدد الوسائط',
  'suggestion.transformer': 'اشرح ازاي بنية المحولات بتشتغل',

  // Settings
  'settings.transparencyMode': 'وضع الشفافية',
  'settings.blackBox': 'صندوق مغلق',
  'settings.blackBoxDesc': 'الوكلاء بيشتغلوا تلقائي — بس النتيجة النهائية بتظهر.',
  'settings.planPreview': 'معاينة الخطة',
  'settings.planPreviewDesc': 'شوف خطة المهمة قبل التنفيذ، بدون رسم بياني مباشر.',
  'settings.fullTransparency': 'شفافية كاملة',
  'settings.fullTransparencyDesc': 'شوف خطة المهمة والرسم البياني المباشر للتنفيذ.',
  'settings.inputMode': 'وضع الإدخال',
  'settings.multimodal': 'متعدد',
  'settings.multimodalDesc': 'نص وصور وصوت.',
  'settings.textImages': 'نص + صور',
  'settings.textImagesDesc': 'نص وصور بس — بدون صوت.',
  'settings.voiceOnly': 'صوت فقط',
  'settings.voiceOnlyDesc': 'إدخال صوتي فقط — بدون نص أو صور.',
  'settings.theme': 'المظهر',
  'settings.dark': 'داكن',
  'settings.darkDesc': 'استخدم المظهر الداكن دايماً.',
  'settings.light': 'فاتح',
  'settings.lightDesc': 'استخدم المظهر الفاتح دايماً.',
  'settings.auto': 'تلقائي',
  'settings.autoDesc': 'اتبع إعداد النظام.',
  'settings.language': 'اللغة',
  'settings.clearHistory': 'مسح السجل',

  // Agents
  'agents.title': 'الوكلاء',
  'agents.subtitle': 'بيتجمعوا ديناميكياً لكل مهمة',
  'agents.noAgents': 'مفيش وكلاء متهيئين',
  'agents.orchestrator': 'المنسق',
  'agents.alwaysActive': 'نشط دايماً',
  'agents.agents': 'الوكلاء',
  'agents.nTools': '{count} أدوات',

  // Agent Detail
  'agentDetail.goal': 'الهدف',
  'agentDetail.tools': 'الأدوات',
  'agentDetail.systemPrompt': 'تعليمات النظام',
  'agentDetail.noSystemPrompt': 'مفيش تعليمات نظام متهيئة.',
  'agentDetail.constitution': 'الدستور',
  'agentDetail.constitutionDesc': 'إرشادات مخصصة بتتضاف لتعليمات النظام بتاعة المنسق.',
  'agentDetail.constitutionPlaceholder': 'مثلاً: فضل arXiv على ويكيبيديا. خلي الخطط أقل من 3 خطوات...',
  'agentDetail.save': 'حفظ',

  // Agent Form
  'agentForm.editAgent': 'تعديل وكيل',
  'agentForm.newAgent': 'وكيل جديد',
  'agentForm.name': 'الاسم',
  'agentForm.namePlaceholder': 'اسم الوكيل',
  'agentForm.description': 'الوصف',
  'agentForm.descriptionPlaceholder': 'الوكيل ده بيعمل إيه؟',
  'agentForm.role': 'الدور',
  'agentForm.rolePlaceholder': 'مثلاً: محلل أبحاث',
  'agentForm.goal': 'الهدف',
  'agentForm.goalPlaceholder': 'هدف الوكيل',
  'agentForm.icon': 'الأيقونة',
  'agentForm.color': 'اللون',
  'agentForm.update': 'تحديث',
  'agentForm.create': 'إنشاء',

  // Task Plan
  'taskPlan.title': 'خطة المهمة',
  'taskPlan.proposed': 'مقترحة',
  'taskPlan.executing': 'قيد التنفيذ',
  'taskPlan.completed': 'مكتملة',
  'taskPlan.failed': 'فشلت',

  // Approval
  'approval.execute': 'تنفيذ',
  'approval.cancel': 'إلغاء',

  // Execution Graph
  'graph.title': 'رسم التنفيذ',
  'graph.planReady': 'الخطة جاهزة',
  'graph.executing': 'جاري التنفيذ...',
  'graph.completed': 'اكتمل',
  'graph.failed': 'فشل',

  // Graph Legend
  'legend.pending': 'معلق',
  'legend.running': 'شغال',
  'legend.complete': 'مكتمل',
  'legend.approval': 'موافقة',
  'legend.failed': 'فشل',

  // Graph Nodes
  'node.output': 'المخرج',
  'node.allComplete': 'اكتمل الكل',
  'node.waiting': 'في الانتظار...',
  'node.orchestrator': 'المنسق',
  'node.checkpoint': 'نقطة فحص',

  // History
  'history.title': 'السجل',
  'history.subtitle': 'المحادثات السابقة',
  'history.noConversations': 'مفيش محادثات سابقة',
  'history.noConversationsHint': 'المحادثات الممسوحة أو الجديدة هتظهر هنا',
  'history.nMessages': '{count} رسائل',

  // Privacy
  'privacy.title': 'إشعار الخصوصية',
  'privacy.description': 'هيتم إرسال بيانات الصوت والصور لـ OpenAI للمعالجة. مفيش بيانات بتتخزن بشكل دائم على سيرفراتنا. بالاستمرار، أنت موافق على المعالجة دي.',
  'privacy.cancel': 'إلغاء',
  'privacy.continue': 'استمرار',

  // Voice
  'voice.micDenied': 'تم رفض الوصول للميكروفون.',

  // Messages (store)
  'msg.voiceMessage': 'رسالة صوتية',
  'msg.imageSent': 'تم إرسال صورة',
  'msg.processing': 'جاري معالجة طلبك...',
  'msg.error': 'حصل خطأ. تأكد إن السيرفر شغال.',
  'msg.allCompleted': 'كل المهام اتنفذت بنجاح!',
  'msg.executionFailed': 'التنفيذ فشل. تأكد من اتصال السيرفر.',

  // Guide
  'guide.title': 'الدليل',
  'guide.subtitle': 'اتعلم ازاي تستخدم AgentFlow',
  'guide.gettingStarted': 'البداية',
  'guide.gettingStartedDesc': 'اكتب رسالة في تبويب المحادثة لوصف أي مهمة. المنسق هيقسمها لخطوات ويوزعها على الوكلاء المتخصصين. اضغط تنفيذ لتشغيل الخطة.',
  'guide.inputModes': 'أوضاع الإدخال',
  'guide.inputModesDesc': 'المتعدد بيقبل نص وصور وصوت. نص + صور بيعطل الصوت. صوت فقط بيحصر الإدخال في الميكروفون. غير الوضع من الإعدادات.',
  'guide.transparencyModes': 'أوضاع الشفافية',
  'guide.transparencyModesDesc': 'الصندوق المغلق بيشغل الوكلاء بصمت وبيعرض النتيجة النهائية بس. معاينة الخطة بتعرض خطة المهمة قبل التنفيذ. الشفافية الكاملة بتعرض الخطة ورسم التنفيذ المباشر.',
  'guide.agents': 'الوكلاء',
  'guide.agentsDesc': 'تبويب الوكلاء بيعرض كل الوكلاء المتاحين. المنسق بيخطط المهام ونشط دايماً. الوكلاء العاملين ممكن تفعلهم أو تعطلهم. اضغط على وكيل لعرض تفاصيله أو تعديل دستوره.',
  'guide.executionGraph': 'رسم التنفيذ',
  'guide.executionGraphDesc': 'في وضع الشفافية الكاملة، رسم بياني موجه (DAG) بيوضح مهام الوكلاء. العقد بتمثل الخطوات؛ الحواف بتوضح التبعيات. الألوان بتوضح الحالة: معلق، شغال، مكتمل، أو فاشل.',
  'guide.history': 'السجل',
  'guide.historyDesc': 'المحادثات السابقة بتتحفظ تلقائي لما تبدأ محادثة جديدة. تصفحهم وافتحهم من تبويب السجل. ممكن تمسح محادثات فردية أو تمسح كل السجل من الإعدادات.',
};

export default ar;
