/**
 * MobileAgents Study — Google Forms Survey Generator
 *
 * Instructions:
 *   1. Go to https://script.google.com and create a new project.
 *   2. Paste this entire file into the editor (replace the default content).
 *   3. Click Run → createSurvey.
 *   4. Authorise the script when prompted.
 *   5. The form URL is logged in the Execution Log (View → Logs).
 */

function createSurvey() {
  var form = FormApp.create('MobileAgents Study Survey');
  form.setDescription(
    'This survey is part of a study on mobile AI agent control. ' +
    'Your responses are anonymous. Complete each section immediately ' +
    'after the corresponding task as instructed by the researcher.'
  );
  form.setCollectEmail(false);
  form.setProgressBar(true);

  // ── SECTION 0: BACKGROUND ──────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Background')
    .setHelpText('Please answer before the study begins.');

  form.addMultipleChoiceItem()
    .setTitle('Age range')
    .setChoiceValues(['18–21', '22–25', '26–30', '31–40', '40+'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Gender')
    .setChoiceValues(['Male', 'Female', 'Non-binary', 'Prefer not to say'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('How often do you use AI assistants (e.g., ChatGPT, Copilot)?')
    .setChoiceValues(['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Rarely / Never'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Have you used a multi-agent AI system before?')
    .setChoiceValues(['Yes', 'No', "I'm not sure"])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Which AI tools do you use regularly? (select all that apply)')
    .setChoiceValues(['ChatGPT', 'GitHub Copilot', 'Google Gemini', 'Claude', 'Cursor', 'Perplexity', 'Other'])
    .setRequired(false);

  // ── HELPER: add 7-point Likert block ──────────────────────────────────────
  function addLikert(title, helpText) {
    return form.addScaleItem()
      .setTitle(title)
      .setHelpText(helpText || '')
      .setBounds(1, 7)
      .setLabels('Strongly Disagree', 'Strongly Agree')
      .setRequired(true);
  }

  // ── HELPER: add page break / section header ────────────────────────────────
  function addSection(title, desc) {
    form.addPageBreakItem().setTitle(title).setHelpText(desc || '');
  }

  // ── PHASE 1: POST-TASK — TRANSPARENCY MODES (repeat × 3) ──────────────────
  var transparencyConfigs = [
    { id: 'C1', name: 'Blackbox',           hint: 'You just completed a task in Blackbox mode.' },
    { id: 'C2', name: 'Plan Preview',        hint: 'You just completed a task in Plan Preview mode.' },
    { id: 'C3', name: 'Full Transparency',  hint: 'You just completed a task in Full Transparency mode.' },
  ];

  transparencyConfigs.forEach(function(c) {
    addSection(
      'Phase 1 — After ' + c.id + ': ' + c.name,
      c.hint + ' Please rate the following statements (1 = Strongly Disagree, 7 = Strongly Agree).'
    );

    // Primary metrics (Jian et al. Trust in Automation + Control + Satisfaction)
    addLikert('I trusted the system\'s output enough to act on it.',        '[Trust]');
    addLikert('I felt in control of what the system did on my behalf.',     '[Perceived Control]');
    addLikert('I am satisfied with this interaction.',                       '[Satisfaction]');

    // Supplementary metrics
    addLikert('The system made it clear what it was going to do before doing it.', '[Expectation Setting]');
    addLikert('It was easy to correct or stop the system when needed.',            '[Repairability]');
    addLikert('I understood why the system made the decisions it did.',            '[Explainability]');
    addLikert('I felt comfortable with the information I shared during this task.','[Privacy Comfort]');

    form.addParagraphTextItem()
      .setTitle('Any comments about this mode? (optional)')
      .setRequired(false);
  });

  // ── PHASE 1: TRANSPARENCY PREFERENCE (after all 3 conditions) ────────────
  addSection(
    'Phase 1 — Overall Transparency Preference',
    'Having used all three modes, please answer the following.'
  );

  form.addMultipleChoiceItem()
    .setTitle('Which transparency mode would you prefer for everyday use?')
    .setChoiceValues([
      'C1 — Blackbox (fastest, no plan shown)',
      'C2 — Plan Preview (plan shown, approve before running)',
      'C3 — Full Transparency (plan + live execution graph)'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Which mode would you prefer for high-stakes tasks (e.g., sending a Slack message on your behalf)?')
    .setChoiceValues([
      'C1 — Blackbox',
      'C2 — Plan Preview',
      'C3 — Full Transparency'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Why did you prefer that mode? What drove your choice?')
    .setRequired(false);

  // ── PHASE 2: POST-TASK — MODALITIES (repeat × 3) ─────────────────────────
  var modalities = [
    { id: 'M1', name: 'Text Input',       hint: 'You just completed the task by typing a text query.' },
    { id: 'M2', name: 'Image Input',      hint: 'You just completed the task by photographing a printed abstract.' },
    { id: 'M3', name: 'Voice Input',      hint: 'You just completed the task by dictating a voice request.' },
  ];

  modalities.forEach(function(m) {
    addSection(
      'Phase 2 — After ' + m.id + ': ' + m.name,
      m.hint
    );

    // Single Ease Question (SEQ)
    form.addScaleItem()
      .setTitle('Overall, how would you rate the difficulty of this task?')
      .setHelpText('[Single Ease Question — SEQ]')
      .setBounds(1, 7)
      .setLabels('Very Difficult', 'Very Easy')
      .setRequired(true);

    // NASA-TLX (1–10 scale; Google Forms caps linear scales at 10)
    form.addSectionHeaderItem()
      .setTitle('NASA Task Load Index')
      .setHelpText('Rate each dimension from 1 (Very Low) to 10 (Very High).');

    form.addScaleItem()
      .setTitle('Mental Demand — How much mental and perceptual activity was required?')
      .setHelpText('[NASA-TLX]')
      .setBounds(1, 10)
      .setLabels('Very Low', 'Very High')
      .setRequired(true);

    form.addScaleItem()
      .setTitle('Physical Demand — How much physical activity was required?')
      .setHelpText('[NASA-TLX]')
      .setBounds(1, 10)
      .setLabels('Very Low', 'Very High')
      .setRequired(true);

    form.addScaleItem()
      .setTitle('Temporal Demand — How much time pressure did you feel?')
      .setHelpText('[NASA-TLX]')
      .setBounds(1, 10)
      .setLabels('Very Low', 'Very High')
      .setRequired(true);

    form.addScaleItem()
      .setTitle('Performance — How successful were you in accomplishing the task?')
      .setHelpText('[NASA-TLX — reversed: 1 = Perfect, 10 = Failure]')
      .setBounds(1, 10)
      .setLabels('Perfect', 'Failure')
      .setRequired(true);

    form.addScaleItem()
      .setTitle('Effort — How hard did you have to work to accomplish the task?')
      .setHelpText('[NASA-TLX]')
      .setBounds(1, 10)
      .setLabels('Very Low', 'Very High')
      .setRequired(true);

    form.addScaleItem()
      .setTitle('Frustration — How irritated, stressed, or annoyed did you feel?')
      .setHelpText('[NASA-TLX]')
      .setBounds(1, 10)
      .setLabels('Very Low', 'Very High')
      .setRequired(true);

    // Modality comfort and context
    addLikert('Using ' + m.name.toLowerCase() + ' felt natural for this type of task.', '[Modality Comfort]');
    addLikert('I would use ' + m.name.toLowerCase() + ' in a public/shared space.', '[Context Appropriateness]');

    form.addParagraphTextItem()
      .setTitle('In what situations would you choose or avoid ' + m.name.toLowerCase() + '? (optional)')
      .setRequired(false);
  });

  // ── PHASE 2: MODALITY PREFERENCE (after all 3 modalities) ────────────────
  addSection(
    'Phase 2 — Overall Modality Preference',
    'Having used all three input modalities, please answer the following.'
  );

  form.addMultipleChoiceItem()
    .setTitle('Which input modality would you use most often on a mobile device?')
    .setChoiceValues(['Text', 'Voice', 'Image (camera)', 'It depends on the situation'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Which modalities felt well-suited to on-the-go use? (select all that apply)')
    .setChoiceValues(['Text', 'Voice', 'Image (camera)'])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('Was there a modality that surprised you — positively or negatively? Why?')
    .setRequired(false);

  // ── PHASE 3: POST-CUSTOMISATION TASK ─────────────────────────────────────
  addSection(
    'Phase 3 — After Customisation Task',
    'You just edited the constitution and toggled agents. Please rate the following ' +
    '(1 = Strongly Disagree, 7 = Strongly Agree).'
  );

  addLikert('I was able to find the constitution editor without help.',        '[Discoverability]');
  addLikert('I understood what the constitution field does.',                  '[Mental Model]');
  addLikert('Editing the constitution changed the system\'s behaviour as I expected.', '[Effectiveness]');
  addLikert('The agent on/off toggles were easy to understand and use.',       '[Controllability]');
  addLikert('After customising the system, I felt more in control.',           '[Perceived Ownership]');
  addLikert('I would use the constitution and agent controls regularly.',       '[Adoption Intent]');

  form.addMultipleChoiceItem()
    .setTitle('Which type of change did you make to the constitution?')
    .setChoiceValues([
      'Added a constraint (e.g., "never send messages without approval")',
      'Changed output style (e.g., "always respond in bullet points")',
      'Changed agent routing (e.g., "always use ArXiv and Semantic Scholar together")',
      'I did not edit the constitution',
      'Other'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Describe what you changed and whether the system behaved as expected.')
    .setRequired(false);

  // ── SECTION: OVERALL POST-STUDY ───────────────────────────────────────────
  addSection(
    'Overall Feedback',
    'Final questions after completing all three phases.'
  );

  addLikert('Overall, I would trust this system to act on my behalf on a mobile device.', '[Overall Trust]');
  addLikert('I felt this system respected my privacy.',                                    '[Privacy]');
  addLikert('I would use this application in my day-to-day work.',                        '[Adoption Intent]');

  form.addMultipleChoiceItem()
    .setTitle('Which single feature contributed most to your trust in the system?')
    .setChoiceValues([
      'Plan Preview (seeing what the system will do)',
      'Checkpoint approval (approving before irreversible actions)',
      'Live execution graph (seeing agents work in real time)',
      'Agent on/off controls',
      'Constitution editor',
      'Multimodal input support'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('Which single feature caused the most friction or concern?')
    .setChoiceValues([
      'Plan approval added too many steps',
      'Live graph was overwhelming on a small screen',
      'Voice input felt risky in shared spaces',
      'Camera / image upload was awkward',
      'Agent controls were hard to find',
      'Constitution was unclear'
    ])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('What is the single most important improvement you would make to this system?')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('Any other comments or suggestions?')
    .setRequired(false);

  // ── DONE ──────────────────────────────────────────────────────────────────
  Logger.log('Form created: ' + form.getEditUrl());
  Logger.log('Shareable URL: ' + form.getPublishedUrl());
}
