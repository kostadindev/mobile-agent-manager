import type { Translations } from './en';

const bg: Translations = {
  // App
  'app.title': 'AgentFlow',
  'app.subtitle': 'Твоят AI екип',
  'app.tagline': 'Твоят персонален AI екип. Опиши задача и остави интелигентните агенти да свършат работата.',

  // Tabs
  'tab.chat': 'Чат',
  'tab.agents': 'Агенти',
  'tab.history': 'История',
  'tab.guide': 'Документи',

  // Chat
  'chat.placeholder': 'Съобщение...',
  'chat.analyzeImage': 'Анализирай тази снимка',
  'chat.agentsWorking': 'Агентите работят...',
  'chat.voiceBadge': 'Глас',
  'chat.imageBadge': 'Снимка',

  // Suggestions
  'suggestion.research': 'Обобщи последните изследвания за разсъждаването на LLM',
  'suggestion.proposal': 'Помогни ми да напиша предложение за мултимодален AI проект',
  'suggestion.transformer': 'Обясни как работят трансформер архитектурите',

  // Settings
  'settings.transparencyMode': 'Режим на прозрачност',
  'settings.blackBox': 'Черна кутия',
  'settings.blackBoxDesc': 'Агентите работят автоматично — показва се само крайният резултат.',
  'settings.planPreview': 'Преглед на план',
  'settings.planPreviewDesc': 'Виж плана преди изпълнение, но без графика на живо.',
  'settings.fullTransparency': 'Пълна прозрачност',
  'settings.fullTransparencyDesc': 'Виж плана и графиката на изпълнение на живо.',
  'settings.inputMode': 'Режим на въвеждане',
  'settings.multimodal': 'Мултимодален',
  'settings.multimodalDesc': 'Текст, изображения и гласов вход.',
  'settings.textImages': 'Текст + снимки',
  'settings.textImagesDesc': 'Само текст и изображения — без глас.',
  'settings.voiceOnly': 'Само глас',
  'settings.voiceOnlyDesc': 'Само гласов вход — без текст или изображения.',
  'settings.theme': 'Тема',
  'settings.dark': 'Тъмна',
  'settings.darkDesc': 'Винаги използвай тъмна тема.',
  'settings.light': 'Светла',
  'settings.lightDesc': 'Винаги използвай светла тема.',
  'settings.auto': 'Авто',
  'settings.autoDesc': 'Следвай системните настройки.',
  'settings.language': 'Език',
  'settings.clearHistory': 'Изчисти историята',

  // Agents
  'agents.title': 'Агенти',
  'agents.subtitle': 'Сглобяват се динамично за всяка задача',
  'agents.noAgents': 'Няма конфигурирани агенти',
  'agents.orchestrator': 'Оркестратор',
  'agents.alwaysActive': 'Винаги активен',
  'agents.agents': 'Агенти',
  'agents.nTools': '{count} инструмента',

  // Agent Detail
  'agentDetail.goal': 'Цел',
  'agentDetail.tools': 'Инструменти',
  'agentDetail.systemPrompt': 'Системен промпт',
  'agentDetail.noSystemPrompt': 'Няма конфигуриран системен промпт.',
  'agentDetail.constitution': 'Конституция',
  'agentDetail.constitutionDesc': 'Допълнителни указания към системния промпт на оркестратора.',
  'agentDetail.constitutionPlaceholder': 'напр. Предпочитай arXiv пред Wikipedia. Дръж плановете под 3 стъпки...',
  'agentDetail.save': 'Запази',

  // Agent Form
  'agentForm.editAgent': 'Редактирай агент',
  'agentForm.newAgent': 'Нов агент',
  'agentForm.name': 'Име',
  'agentForm.namePlaceholder': 'Име на агента',
  'agentForm.description': 'Описание',
  'agentForm.descriptionPlaceholder': 'Какво прави този агент?',
  'agentForm.role': 'Роля',
  'agentForm.rolePlaceholder': 'напр. Аналитик',
  'agentForm.goal': 'Цел',
  'agentForm.goalPlaceholder': 'Цел на агента',
  'agentForm.icon': 'Икона',
  'agentForm.color': 'Цвят',
  'agentForm.update': 'Обнови',
  'agentForm.create': 'Създай',

  // Task Plan
  'taskPlan.title': 'План на задачата',
  'taskPlan.proposed': 'Предложен',
  'taskPlan.executing': 'Изпълнява се',
  'taskPlan.completed': 'Завършен',
  'taskPlan.failed': 'Неуспешен',

  // Approval
  'approval.execute': 'Изпълни',
  'approval.cancel': 'Откажи',

  // Execution Graph
  'graph.title': 'Графика на изпълнение',
  'graph.planReady': 'Планът е готов',
  'graph.executing': 'Изпълнява се...',
  'graph.completed': 'Завършено',
  'graph.failed': 'Неуспешно',

  // Graph Legend
  'legend.pending': 'Чакащ',
  'legend.running': 'Работи',
  'legend.complete': 'Готово',
  'legend.approval': 'Одобрение',
  'legend.failed': 'Неуспешно',

  // Graph Nodes
  'node.output': 'Изход',
  'node.allComplete': 'Всичко готово',
  'node.waiting': 'Изчакване...',
  'node.orchestrator': 'Оркестратор',
  'node.checkpoint': 'Контролна точка',

  // History
  'history.title': 'История',
  'history.subtitle': 'Минали разговори',
  'history.noConversations': 'Няма минали разговори',
  'history.noConversationsHint': 'Изчистени или нови чатове ще се появят тук',
  'history.nMessages': '{count} съобщения',

  // Privacy
  'privacy.title': 'Уведомление за поверителност',
  'privacy.description': 'Гласови и визуални данни ще бъдат изпратени до OpenAI за обработка. Никакви данни не се съхраняват постоянно на нашите сървъри. Продължавайки, вие се съгласявате с тази обработка.',
  'privacy.cancel': 'Откажи',
  'privacy.continue': 'Продължи',

  // Voice
  'voice.micDenied': 'Достъпът до микрофона е отказан.',

  // Messages (store)
  'msg.voiceMessage': 'Гласово съобщение',
  'msg.imageSent': 'Изпратена снимка',
  'msg.processing': 'Обработка на заявката ти...',
  'msg.error': 'Нещо се обърка. Провери дали сървърът работи.',
  'msg.allCompleted': 'Всички задачи са изпълнени успешно!',
  'msg.executionFailed': 'Изпълнението се провали. Провери връзката със сървъра.',

  // Guide
  'guide.title': 'Документи',
  'guide.subtitle': 'Научи как да използваш AgentFlow',
  'guide.gettingStarted': 'Първи стъпки',
  'guide.gettingStartedDesc': 'Напиши съобщение в таба Чат, за да опишеш задача. Оркестраторът ще я раздели на стъпки и ще ги разпредели на специализирани агенти. Натисни Изпълни, за да стартираш плана.',
  'guide.inputModes': 'Режими на въвеждане',
  'guide.inputModesDesc': 'Мултимодалният приема текст, изображения и глас. Текст + снимки деактивира гласа. Само глас ограничава входа до микрофона. Смени режима от Настройки.',
  'guide.transparencyModes': 'Режими на прозрачност',
  'guide.transparencyModesDesc': 'Черната кутия изпълнява агентите тихо и показва само крайния резултат. Преглед на план показва плана преди изпълнение. Пълна прозрачност показва плана и графиката на изпълнение на живо.',
  'guide.agents': 'Агенти',
  'guide.agentsDesc': 'Табът Агенти показва всички налични агенти. Оркестраторът планира задачи и е винаги активен. Работните агенти могат да се включват/изключват. Натисни агент, за да видиш детайлите му или да редактираш конституцията му.',
  'guide.executionGraph': 'Графика на изпълнение',
  'guide.executionGraphDesc': 'В режим Пълна прозрачност, насочен ацикличен граф (DAG) визуализира задачите на агентите. Възлите представляват стъпки; ребрата показват зависимости. Цветовете указват статус: чакащ, работи, завършен или неуспешен.',
  'guide.history': 'История',
  'guide.historyDesc': 'Минали разговори се запазват автоматично, когато започнеш нов чат. Разгледай ги и ги отвори от таба История. Можеш да изтриеш отделни разговори или да изчистиш цялата история от Настройки.',
};

export default bg;
