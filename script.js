(() => {
  const actions = [
    { id: 'porthole', label: 'inspecting the porthole', caption: 'PORTSIDE INSPECTION, COMPLETELY ROUTINE' },
    { id: 'key', label: 'guarding the snack locker key', caption: 'THE KEY IS SAFER WITH HIM, APPARENTLY' },
    { id: 'tally', label: 'tallying the fish', caption: 'THE NUMBERS ARE BEING REVIEWED' },
    { id: 'bath', label: 'avoiding a bath', caption: 'THE BASIN MADE THE FIRST MOVE' }
  ];
  const dyes = [
    { id: 'sea-green', label: 'sea green' },
    { id: 'rust', label: 'weathered rust' },
    { id: 'navy', label: 'deep navy' },
    { id: 'ochre', label: 'ochre' }
  ];
  const expressions = [
    { id: 'calm', label: 'calm and undisclosed' },
    { id: 'suspicious', label: 'mildly suspicious' },
    { id: 'proud', label: 'proud of something' },
    { id: 'alarmed', label: 'heard the word bath' },
    { id: 'focused', label: 'fish-focused' },
    { id: 'stern', label: 'on watch' },
    { id: 'sleepy', label: 'off-duty' },
    { id: 'judging', label: 'quietly judging' },
    { id: 'innocent', label: 'entirely innocent' }
  ];
  const state = { mode: 'official', expression: 'calm', action: 'porthole', dye: 'sea-green' };
  const basePortrait = document.getElementById('basePortrait');
  const expressionWindow = document.getElementById('expressionWindow');
  const expressionSheet = document.getElementById('expressionSheet');
  const sceneWindow = document.getElementById('sceneWindow');
  const sceneSheet = document.getElementById('sceneSheet');
  const portraitName = document.getElementById('portraitName');
  const patchName = document.getElementById('patchName');
  const crewName = document.getElementById('crewName');
  const issuedFile = document.getElementById('issuedFile');
  const issuedName = document.getElementById('issuedName');
  const issuedAction = document.getElementById('issuedAction');
  const modeNote = document.getElementById('modeNote');
  const canvas = document.getElementById('downloadCanvas');

  function selectedAction() { return actions.find(item => item.id === state.action); }
  function selectedDye() { return dyes.find(item => item.id === state.dye); }
  function selectedExpression() { return expressions.find(item => item.id === state.expression); }
  function cleanName() { return crewName.value.trim() || 'AquaCat'; }
  function sceneCellPosition() {
    return { col: dyes.findIndex(item => item.id === state.dye), row: actions.findIndex(item => item.id === state.action) };
  }
  function expressionCellPosition() {
    const index = expressions.findIndex(item => item.id === state.expression);
    return { col: index % 3, row: Math.floor(index / 3) };
  }
  function render() {
    const isOfficial = state.mode === 'official';
    const sceneCell = sceneCellPosition();
    const expressionCell = expressionCellPosition();
    basePortrait.hidden = true;
    expressionWindow.hidden = !isOfficial;
    expressionWindow.setAttribute('aria-hidden', String(!isOfficial));
    sceneWindow.hidden = isOfficial;
    sceneWindow.setAttribute('aria-hidden', String(isOfficial));
    expressionSheet.style.transform = `translate(${-expressionCell.col * (100 / 3)}%, ${-expressionCell.row * (100 / 3)}%)`;
    sceneSheet.style.transform = `translate(${-sceneCell.col * 25}%, ${-sceneCell.row * 25}%)`;
    portraitName.textContent = isOfficial
      ? `OFFICIAL PORTRAIT: ${selectedExpression().label.toUpperCase()}`
      : selectedAction().caption;
    patchName.textContent = cleanName();
    modeNote.textContent = isOfficial
      ? `Official record: ${selectedExpression().label}. No further questions were asked.`
      : `Photographic record: ${selectedAction().label}, in a ${selectedDye().label} canvas suit.`;
    document.querySelectorAll('[data-mode]').forEach(button => {
      const selected = button.dataset.mode === state.mode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-expression]').forEach(button => {
      const selected = button.dataset.expression === state.expression;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-action]').forEach(button => {
      const selected = button.dataset.action === state.action;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-dye]').forEach(button => {
      const selected = button.dataset.dye === state.dye;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('.scene-control').forEach(group => group.classList.toggle('is-disabled', isOfficial));
    document.querySelectorAll('.expression-control').forEach(group => group.classList.toggle('is-disabled', !isOfficial));
  }
  function issueFile() {
    issuedName.textContent = cleanName();
    issuedAction.textContent = state.mode === 'official'
      ? `Official portrait on file. Expression logged as ${selectedExpression().label}.`
      : `Was photographed ${selectedAction().label}, wearing a ${selectedDye().label} canvas suit.`;
    issuedFile.hidden = false;
    issuedFile.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }
  function fitText(context, text, maxWidth) {
    let result = text.toUpperCase();
    while (result.length > 1 && context.measureText(result).width > maxWidth) result = `${result.slice(0, -2)}…`;
    return result;
  }
  document.getElementById('controls').addEventListener('click', event => {
    const mode = event.target.closest('[data-mode]');
    const expression = event.target.closest('[data-expression]');
    const action = event.target.closest('[data-action]');
    const dye = event.target.closest('[data-dye]');
    if (mode) { state.mode = mode.dataset.mode; render(); }
    if (expression && state.mode === 'official') { state.expression = expression.dataset.expression; render(); }
    if (action && state.mode === 'scene') { state.action = action.dataset.action; render(); }
    if (dye && state.mode === 'scene') { state.dye = dye.dataset.dye; render(); }
  });
  crewName.addEventListener('input', render);
  document.getElementById('randomizeButton').addEventListener('click', () => {
    state.mode = Math.random() < 0.5 ? 'official' : 'scene';
    state.expression = expressions[Math.floor(Math.random() * expressions.length)].id;
    state.action = actions[Math.floor(Math.random() * actions.length)].id;
    state.dye = dyes[Math.floor(Math.random() * dyes.length)].id;
    render();
  });
  document.getElementById('issueButton').addEventListener('click', issueFile);
  document.getElementById('resetButton').addEventListener('click', () => {
    state.mode = 'official';
    state.expression = 'calm';
    state.action = 'porthole';
    state.dye = 'sea-green';
    crewName.value = 'AquaCat';
    issuedFile.hidden = true;
    render();
  });
  document.getElementById('downloadButton').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    if (!context) return;
    const imageHeight = 900;
    context.fillStyle = '#f7f1e7';
    context.fillRect(0, 0, 1200, 1440);
    if (state.mode === 'official') {
      const { col, row } = expressionCellPosition();
      const cellWidth = expressionSheet.naturalWidth / 3;
      const cellHeight = expressionSheet.naturalHeight / 3;
      context.drawImage(expressionSheet, col * cellWidth, row * cellHeight, cellWidth, cellHeight, 0, 0, 1200, imageHeight);
    } else {
      const { col, row } = sceneCellPosition();
      const cellWidth = sceneSheet.naturalWidth / 4;
      const cellHeight = sceneSheet.naturalHeight / 4;
      context.drawImage(sceneSheet, col * cellWidth, row * cellHeight, cellWidth, cellHeight, 0, 0, 1200, imageHeight);
    }
    context.save();
    context.translate(250, 785);
    context.rotate(-.052);
    context.fillStyle = '#eee4c9';
    context.fillRect(-186, -43, 372, 86);
    context.strokeStyle = '#182f2a';
    context.lineWidth = 3;
    context.strokeRect(-186, -43, 372, 86);
    context.strokeStyle = 'rgba(255,253,247,.55)';
    context.lineWidth = 4;
    context.strokeRect(-178, -35, 356, 70);
    context.fillStyle = '#182f2a';
    context.font = '900 29px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(fitText(context, cleanName(), 320), 0, 2);
    context.restore();
    context.fillStyle = '#182f2a';
    context.fillRect(0, 900, 1200, 540);
    context.fillStyle = '#f7f1e7';
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    context.font = '700 25px Arial';
    context.fillText('AQUACAT EXPEDITION RECORD', 55, 980);
    context.font = 'bold 66px Georgia';
    context.fillText(cleanName(), 55, 1060);
    context.font = '28px Georgia';
    const record = state.mode === 'official'
      ? `Expression: ${selectedExpression().label}.`
      : `Seen ${selectedAction().label}.`;
    context.fillText(record, 55, 1120);
    if (state.mode === 'scene') context.fillText(`Canvas suit: ${selectedDye().label}.`, 55, 1170);
    const link = document.createElement('a');
    link.download = `aquacat-${cleanName().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-case-file.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
  render();
})();
