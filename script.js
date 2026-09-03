let currentLevel = 'A1';
let currentTopic = null;
let currentIndex = 0;
let score = 0;
let selectedAnswered = false;
let currentExerciseType = 'chooseEmoji';
let currentTrueFalseAnswer = true;
let selectedWords = [];
let currentSentenceAnswer = '';
let selectedMatchLeft = null;
let selectedMatchRight = null;
let matchedPairs = 0;
let matchTotal = 0;
let mistakes = 0;

const exerciseTypes = [
  'chooseEmoji',
  'listenChoose',
  'meaningChoose',
  'trueFalse',
  'typeWord',
  'translateToSpanish',
  'translateToEnglish',
  'scrambleLetters',
  'completeWord',
  'sentenceOrder',
  'completeSentence',
  'matchMeaning'
];

function hideAllScreens() {
  document.getElementById('homeScreen').classList.add('hidden');
  document.getElementById('levelScreen').classList.add('hidden');
  document.getElementById('topicScreen').classList.add('hidden');
  document.getElementById('lessonScreen').classList.add('hidden');
  document.getElementById('resultScreen').classList.add('hidden');
}

function goHome() {
  hideAllScreens();
  document.getElementById('homeScreen').classList.remove('hidden');
}

function showLevels() {
  hideAllScreens();
  document.getElementById('levelScreen').classList.remove('hidden');
}

function selectLevel(level) {
  currentLevel = level;
  showTopics();
}

function showTopics() {
  hideAllScreens();
  document.getElementById('topicScreen').classList.remove('hidden');
  document.getElementById('currentLevelBadge').textContent = 'Nivel ' + currentLevel;
  loadProgressBadge();
  renderTopics();
}

function renderTopics() {
  const topicGrid = document.getElementById('topicGrid');
  topicGrid.innerHTML = '';

  appData[currentLevel].topics.forEach(topic => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="emoji">${topic.icon}</div>
      <h3>${topic.title}</h3>
      <p>${topic.description}</p>
      <button class="btn btn-primary">Comenzar</button>
    `;
    div.onclick = () => startTopic(topic.id);
    topicGrid.appendChild(div);
  });
}

function startTopic(topicId) {
  currentTopic = appData[currentLevel].topics.find(t => t.id === topicId);
  currentIndex = 0;
  score = 0;
  mistakes = 0;
  selectedAnswered = false;
  showLesson();
}

function showLesson() {
  hideAllScreens();
  document.getElementById('lessonScreen').classList.remove('hidden');
  document.getElementById('studyArea').classList.remove('hidden');
  document.getElementById('quizArea').classList.add('hidden');
  document.getElementById('nextBtn').classList.add('hidden');

  resetQuizAreas();
  selectedAnswered = false;

  const lesson = getCurrentLesson();

  document.getElementById('topicBadge').textContent = currentTopic.title;
  document.getElementById('scoreBadge').textContent = 'Puntos: ' + score;
  document.getElementById('wordText').textContent = lesson.word;
  document.getElementById('meaningText').textContent = lesson.meaning;

  renderLessonVisual('lessonImageBox', lesson);
  updateProgressBar();
}

function resetQuizAreas() {
  document.getElementById('optionsBox').innerHTML = '';
  document.getElementById('typeBox').innerHTML = '';
  document.getElementById('quizVisualBox').innerHTML = '';

  const feedback = document.getElementById('feedbackMessage');
  feedback.textContent = '';
  feedback.className = 'message';

  selectedWords = [];
  selectedMatchLeft = null;
  selectedMatchRight = null;
  matchedPairs = 0;
  matchTotal = 0;
}

function getCurrentLesson() {
  return currentTopic.lessons[currentIndex];
}

function updateProgressBar() {
  const total = currentTopic.lessons.length;
  const percent = Math.round((currentIndex / total) * 100);
  document.getElementById('progressBar').style.width = percent + '%';
}

function renderLessonVisual(containerId, lesson) {
  const box = document.getElementById(containerId);
  if (lesson.image) {
    box.innerHTML = `<img src="${lesson.image}" alt="${lesson.word}">`;
  } else {
    box.innerHTML = lesson.emoji;
  }
}

function renderOptionVisual(lesson) {
  if (lesson.image) return `<img src="${lesson.image}" alt="Opción">`;
  return `<span class="small-emoji">${lesson.emoji}</span>`;
}

function renderQuizVisual(lesson) {
  if (lesson.image) return `<div class="quiz-visual"><img src="${lesson.image}" alt="Imagen"></div>`;
  return `<div class="quiz-visual">${lesson.emoji}</div>`;
}

function playCurrentAudio() {
  const lesson = getCurrentLesson();
  speakOrAudio(lesson.word, lesson.audio);
}

function speakOrAudio(text, audioPath = '') {
  if (audioPath) {
    const audio = new Audio(audioPath);
    audio.play().catch(() => speakEnglish(text));
  } else {
    speakEnglish(text);
  }
}

function speakEnglish(text) {
  if (!('speechSynthesis' in window)) {
    alert('Tu navegador no soporta voz automática. Después podemos usar archivos MP3.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.82;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v =>
    v.lang.toLowerCase().includes('en-us') ||
    v.lang.toLowerCase().includes('en-gb') ||
    v.name.toLowerCase().includes('english')
  );

  if (englishVoice) utterance.voice = englishVoice;
  window.speechSynthesis.speak(utterance);
}

function testVoice() {
  speakEnglish('Hello! Welcome to English Kids Interactive. Let us learn English together.');
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

function showQuestion() {
  document.getElementById('studyArea').classList.add('hidden');
  document.getElementById('quizArea').classList.remove('hidden');
  document.getElementById('nextBtn').classList.add('hidden');

  resetQuizAreas();
  selectedAnswered = false;

  currentExerciseType = exerciseTypes[currentIndex % exerciseTypes.length];

  if (currentExerciseType === 'chooseEmoji') renderChooseEmojiExercise();
  if (currentExerciseType === 'listenChoose') renderListenChooseExercise();
  if (currentExerciseType === 'meaningChoose') renderMeaningChooseExercise();
  if (currentExerciseType === 'trueFalse') renderTrueFalseExercise();
  if (currentExerciseType === 'typeWord') renderTypeWordExercise();
  if (currentExerciseType === 'translateToSpanish') renderTranslateToSpanishExercise();
  if (currentExerciseType === 'translateToEnglish') renderTranslateToEnglishExercise();
  if (currentExerciseType === 'scrambleLetters') renderScrambleLettersExercise();
  if (currentExerciseType === 'completeWord') renderCompleteWordExercise();
  if (currentExerciseType === 'sentenceOrder') renderSentenceOrderExercise();
  if (currentExerciseType === 'completeSentence') renderCompleteSentenceExercise();
  if (currentExerciseType === 'matchMeaning') renderMatchMeaningExercise();
}

function setExerciseHeader(label, question, help) {
  document.getElementById('exerciseLabel').textContent = label;
  document.getElementById('questionText').textContent = question;
  document.getElementById('questionHelp').textContent = help;
}

function renderChooseEmojiExercise() {
  const lesson = getCurrentLesson();
  setExerciseHeader('Ejercicio: elegir imagen', `Which one is "${lesson.word}"?`, 'Selecciona el emoji correcto.');
  speakEnglish(`Which one is ${lesson.word}?`);
  renderEmojiOptions();
}

function renderListenChooseExercise() {
  setExerciseHeader('Ejercicio: escuchar y elegir', 'Listen and choose the correct answer', 'Escucha la palabra y selecciona el emoji correcto.');
  const replayButton = document.createElement('button');
  replayButton.className = 'btn btn-primary';
  replayButton.textContent = '🔊 Repetir audio';
  replayButton.onclick = () => playCurrentAudio();
  document.getElementById('quizVisualBox').appendChild(replayButton);
  playCurrentAudio();
  renderEmojiOptions();
}

function renderMeaningChooseExercise() {
  const lesson = getCurrentLesson();
  setExerciseHeader('Ejercicio: español a imagen', `Which one means "${lesson.meaning}"?`, 'Lee el significado en español y elige el emoji correcto.');
  renderEmojiOptions();
}

function renderTrueFalseExercise() {
  const lesson = getCurrentLesson();
  const randomLesson = getRandomLessonFromTopic();
  currentTrueFalseAnswer = Math.random() >= 0.5;
  const shownLesson = currentTrueFalseAnswer ? lesson : randomLesson;

  setExerciseHeader('Ejercicio: verdadero o falso', `Is this "${lesson.word}"?`, 'Observa el emoji y responde Yes o No.');
  document.getElementById('quizVisualBox').innerHTML = renderQuizVisual(shownLesson);

  document.getElementById('typeBox').innerHTML = `
    <button class="btn btn-green" onclick="checkTrueFalse(true)">Yes</button>
    <button class="btn btn-orange" onclick="checkTrueFalse(false)">No</button>
  `;
  speakEnglish(`Is this ${lesson.word}?`);
}

function renderTypeWordExercise() {
  const lesson = getCurrentLesson();
  setExerciseHeader('Ejercicio: escribir palabra', 'Write the word in English', 'Observa el emoji y el significado. Escribe la palabra en inglés.');
  document.getElementById('quizVisualBox').innerHTML = `${renderQuizVisual(lesson)}<h2>${lesson.meaning}</h2>`;
  renderTextInput('Escribe en inglés', 'checkTypedAnswer');
}

function renderTranslateToSpanishExercise() {
  const lesson = getCurrentLesson();
  setExerciseHeader('Ejercicio: inglés a español', `What does "${lesson.word}" mean?`, 'Selecciona la traducción correcta.');
  speakEnglish(lesson.word);
  renderMeaningTextOptions();
}

function renderTranslateToEnglishExercise() {
  const lesson = getCurrentLesson();
  setExerciseHeader('Ejercicio: español a inglés', `¿Cómo se dice "${lesson.meaning}" en inglés?`, 'Selecciona la respuesta correcta.');
  renderWordTextOptions();
}

function renderScrambleLettersExercise() {
  const lesson = getCurrentLesson();
  const clean = lesson.word.replace(/\s+/g, '');
  const scrambled = shuffleArray(clean.split('')).join('   ');
  setExerciseHeader('Ejercicio: ordenar letras', 'Ordena las letras y escribe la palabra', `Letras: ${scrambled}`);
  document.getElementById('quizVisualBox').innerHTML = renderQuizVisual(lesson);
  renderTextInput('Escribe la palabra correcta', 'checkTypedAnswer');
}

function renderCompleteWordExercise() {
  const lesson = getCurrentLesson();
  const masked = maskWord(lesson.word);
  setExerciseHeader('Ejercicio: completar palabra', `Completa la palabra: ${masked}`, 'Escribe la palabra completa en inglés.');
  document.getElementById('quizVisualBox').innerHTML = renderQuizVisual(lesson);
  renderTextInput('Palabra completa', 'checkTypedAnswer');
}

function renderSentenceOrderExercise() {
  const lesson = getCurrentLesson();
  const sentence = lesson.sentence || lesson.word;
  currentSentenceAnswer = sentence;
  const words = shuffleArray(sentence.replace(/[.?!]/g, '').split(/\s+/));

  setExerciseHeader('Ejercicio: ordenar frase', 'Ordena las palabras para formar la frase', lesson.sentenceMeaning || 'Forma la frase correcta.');
  document.getElementById('quizVisualBox').innerHTML = `<div class="sentence-box" id="sentenceBox">Toca las palabras en orden</div>`;

  const bank = document.createElement('div');
  bank.className = 'word-bank';

  words.forEach(word => {
    const chip = document.createElement('button');
    chip.className = 'word-chip';
    chip.textContent = word;
    chip.onclick = () => selectSentenceWord(chip, word);
    bank.appendChild(chip);
  });

  document.getElementById('typeBox').appendChild(bank);

  const checkBtn = document.createElement('button');
  checkBtn.className = 'btn btn-primary';
  checkBtn.textContent = 'Revisar frase';
  checkBtn.onclick = checkSentenceOrder;
  document.getElementById('typeBox').appendChild(checkBtn);
}

function renderCompleteSentenceExercise() {
  const lesson = getCurrentLesson();
  const sentence = lesson.sentence || lesson.word;
  const words = sentence.replace(/[.?!]/g, '').split(/\s+/);
  const target = words.length > 2 ? words[1] : words[0];
  const incomplete = sentence.replace(target, '____');

  setExerciseHeader('Ejercicio: completar oración', incomplete, 'Selecciona la palabra que completa la oración.');

  let fakeOptions = getRandomWordsFromTopic(2).map(item => firstWord(item.word));
  let options = [target, ...fakeOptions];
  options = shuffleArray([...new Set(options)]).slice(0, 3);

  renderSimpleTextOptions(options, target);
}

function renderMatchMeaningExercise() {
  setExerciseHeader('Ejercicio: relacionar', 'Relaciona palabra con significado', 'Primero toca una palabra en inglés y luego su significado en español.');

  const items = shuffleArray([...currentTopic.lessons]).slice(0, 4);
  matchTotal = items.length;
  matchedPairs = 0;

  const left = shuffleArray([...items]);
  const right = shuffleArray([...items]);

  const leftBox = document.createElement('div');
  leftBox.className = 'match-grid';
  const rightBox = document.createElement('div');
  rightBox.className = 'match-grid';

  left.forEach(item => {
    const card = document.createElement('button');
    card.className = 'match-card';
    card.textContent = item.word;
    card.dataset.word = item.word;
    card.onclick = () => selectMatchLeft(card);
    leftBox.appendChild(card);
  });

  right.forEach(item => {
    const card = document.createElement('button');
    card.className = 'match-card';
    card.textContent = item.meaning;
    card.dataset.word = item.word;
    card.onclick = () => selectMatchRight(card);
    rightBox.appendChild(card);
  });

  document.getElementById('quizVisualBox').innerHTML = '<h3>Palabras</h3>';
  document.getElementById('quizVisualBox').appendChild(leftBox);
  const meaningTitle = document.createElement('h3');
  meaningTitle.textContent = 'Significados';
  document.getElementById('typeBox').appendChild(meaningTitle);
  document.getElementById('typeBox').appendChild(rightBox);
}

function renderTextInput(placeholder, checkFunctionName) {
  const typeBox = document.getElementById('typeBox');
  typeBox.innerHTML = `
    <input id="typedAnswer" class="answer-input" type="text" placeholder="${placeholder}" autocomplete="off">
    <button class="btn btn-primary" onclick="${checkFunctionName}()">Revisar</button>
  `;
  const input = document.getElementById('typedAnswer');
  input.focus();
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') window[checkFunctionName]();
  });
}

function renderEmojiOptions() {
  const options = getOptionsForCurrentLesson();
  const optionsBox = document.getElementById('optionsBox');
  optionsBox.innerHTML = '';

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.dataset.word = option.word;
    btn.setAttribute('aria-label', 'Opción de respuesta');
    btn.innerHTML = renderOptionVisual(option);
    btn.onclick = () => checkAnswer(btn, option.word, getCurrentLesson().word);
    optionsBox.appendChild(btn);
  });
}

function renderMeaningTextOptions() {
  const options = getOptionsForCurrentLesson();
  renderSimpleTextOptions(options.map(o => o.meaning), getCurrentLesson().meaning);
}

function renderWordTextOptions() {
  const options = getOptionsForCurrentLesson();
  renderSimpleTextOptions(options.map(o => o.word), getCurrentLesson().word);
}

function renderSimpleTextOptions(options, correctText) {
  const optionsBox = document.getElementById('optionsBox');
  optionsBox.innerHTML = '';

  shuffleArray(options).forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.dataset.answer = text;
    btn.innerHTML = `<span class="option-text">${text}</span>`;
    btn.onclick = () => checkTextOption(btn, text, correctText);
    optionsBox.appendChild(btn);
  });
}

function getOptionsForCurrentLesson() {
  const correctLesson = getCurrentLesson();
  let options = [correctLesson];
  const available = currentTopic.lessons.filter(item => item.word !== correctLesson.word);
  shuffleArray(available);
  options = options.concat(available.slice(0, 2));
  return shuffleArray(options);
}

function checkAnswer(button, selectedWord, correctWord) {
  if (selectedAnswered) return;
  selectedAnswered = true;

  const allOptions = document.querySelectorAll('.option');
  allOptions.forEach(option => {
    if (option.dataset.word === correctWord) option.classList.add('correct');
  });

  if (normalizeText(selectedWord) === normalizeText(correctWord)) {
    addCorrectAnswer(button);
  } else {
    mistakes++;
    button.classList.add('wrong');
    showWrongMessage(correctWord);
  }

  updateScoreAndShowNext();
}

function checkTextOption(button, selectedText, correctText) {
  if (selectedAnswered) return;
  selectedAnswered = true;

  document.querySelectorAll('.option').forEach(option => {
    if (normalizeText(option.dataset.answer) === normalizeText(correctText)) option.classList.add('correct');
  });

  if (normalizeText(selectedText) === normalizeText(correctText)) {
    addCorrectAnswer(button);
  } else {
    mistakes++;
    button.classList.add('wrong');
    showWrongMessage(correctText);
  }

  updateScoreAndShowNext();
}

function checkTrueFalse(userAnswer) {
  if (selectedAnswered) return;
  selectedAnswered = true;

  if (userAnswer === currentTrueFalseAnswer) {
    score += 10;
    showCorrectMessage();
  } else {
    mistakes++;
    showWrongMessage(getCurrentLesson().word);
  }

  updateScoreAndShowNext();
}

function checkTypedAnswer() {
  if (selectedAnswered) return;

  const input = document.getElementById('typedAnswer');
  const userText = input.value.trim();
  const correctWord = getCurrentLesson().word;

  if (!userText) {
    alert('Escribe una respuesta primero.');
    input.focus();
    return;
  }

  selectedAnswered = true;

  if (normalizeText(userText) === normalizeText(correctWord)) {
    input.classList.add('correct');
    score += 10;
    showCorrectMessage();
  } else {
    mistakes++;
    input.classList.add('wrong');
    showWrongMessage(correctWord);
  }

  updateScoreAndShowNext();
}

function selectSentenceWord(chip, word) {
  if (selectedAnswered) return;
  selectedWords.push(word);
  chip.disabled = true;
  chip.style.opacity = '0.45';
  document.getElementById('sentenceBox').textContent = selectedWords.join(' ');
}

function checkSentenceOrder() {
  if (selectedAnswered) return;
  if (!selectedWords.length) {
    alert('Primero toca las palabras para formar la frase.');
    return;
  }

  selectedAnswered = true;
  const userSentence = selectedWords.join(' ');
  const cleanAnswer = currentSentenceAnswer.replace(/[.?!]/g, '');

  if (normalizeText(userSentence) === normalizeText(cleanAnswer)) {
    score += 10;
    document.getElementById('sentenceBox').classList.add('correct');
    showCorrectMessage();
  } else {
    mistakes++;
    document.getElementById('sentenceBox').classList.add('wrong');
    showWrongMessage(cleanAnswer);
  }

  updateScoreAndShowNext();
}

function selectMatchLeft(card) {
  if (selectedAnswered || card.disabled) return;
  document.querySelectorAll('.match-card').forEach(c => {
    if (!c.disabled && c.textContent !== c.dataset.word) return;
  });
  if (selectedMatchLeft) selectedMatchLeft.classList.remove('selected');
  selectedMatchLeft = card;
  card.classList.add('selected');
  tryMatchCards();
}

function selectMatchRight(card) {
  if (selectedAnswered || card.disabled) return;
  if (selectedMatchRight) selectedMatchRight.classList.remove('selected');
  selectedMatchRight = card;
  card.classList.add('selected');
  tryMatchCards();
}

function tryMatchCards() {
  if (!selectedMatchLeft || !selectedMatchRight) return;

  if (selectedMatchLeft.dataset.word === selectedMatchRight.dataset.word) {
    selectedMatchLeft.classList.add('correct');
    selectedMatchRight.classList.add('correct');
    selectedMatchLeft.disabled = true;
    selectedMatchRight.disabled = true;
    selectedMatchLeft.classList.remove('selected');
    selectedMatchRight.classList.remove('selected');
    selectedMatchLeft = null;
    selectedMatchRight = null;
    matchedPairs++;

    if (matchedPairs >= matchTotal) {
      selectedAnswered = true;
      score += 10;
      showCorrectMessage();
      updateScoreAndShowNext();
    }
  } else {
    const left = selectedMatchLeft;
    const right = selectedMatchRight;
    left.classList.add('wrong');
    right.classList.add('wrong');
    mistakes++;
    setTimeout(() => {
      left.classList.remove('wrong', 'selected');
      right.classList.remove('wrong', 'selected');
    }, 600);
    selectedMatchLeft = null;
    selectedMatchRight = null;
  }
}

function addCorrectAnswer(button) {
  score += 10;
  if (button) button.classList.add('correct');
  showCorrectMessage();
}

function showCorrectMessage() {
  const feedback = document.getElementById('feedbackMessage');
  feedback.textContent = '✅ Correct! Great job!';
  feedback.classList.add('ok');
  speakEnglish('Correct! Great job!');
}

function showWrongMessage(correctWord) {
  const feedback = document.getElementById('feedbackMessage');
  feedback.textContent = '❌ Try again! Respuesta correcta: ' + correctWord;
  feedback.classList.add('bad');
  speakEnglish('Try again. The correct answer is ' + correctWord);
}

function updateScoreAndShowNext() {
  document.getElementById('scoreBadge').textContent = 'Puntos: ' + score;
  document.getElementById('nextBtn').classList.remove('hidden');
}

function normalizeText(text) {
  return text.toString().trim().toLowerCase()
    .replace(/[¿?¡!.,]/g, '')
    .replace(/\s+/g, ' ');
}

function maskWord(word) {
  if (word.length <= 2) return word[0] + '_';
  const chars = word.split('');
  for (let i = 1; i < chars.length - 1; i += 2) {
    if (chars[i] !== ' ') chars[i] = '_';
  }
  return chars.join(' ');
}

function firstWord(text) {
  return text.split(/\s+/)[0];
}

function getRandomWordsFromTopic(count) {
  const correctLesson = getCurrentLesson();
  const available = currentTopic.lessons.filter(item => item.word !== correctLesson.word);
  shuffleArray(available);
  return available.slice(0, count);
}

function getRandomLessonFromTopic() {
  const correctLesson = getCurrentLesson();
  const available = currentTopic.lessons.filter(item => item.word !== correctLesson.word);
  shuffleArray(available);
  return available[0] || correctLesson;
}

function nextLesson() {
  currentIndex++;

  if (currentIndex >= currentTopic.lessons.length) {
    finishTopic();
  } else {
    showLesson();
  }
}

function finishTopic() {
  hideAllScreens();
  document.getElementById('resultScreen').classList.remove('hidden');

  const total = currentTopic.lessons.length * 10;
  const percent = Math.round((score / total) * 100);

  document.getElementById('finalResultText').innerHTML = `
    Tema: <strong>${currentTopic.title}</strong><br>
    Puntuación: <strong>${score} de ${total}</strong><br>
    Resultado: <strong>${percent}%</strong>
  `;

  document.getElementById('resultStats').innerHTML = `
    <div class="stat-card">Nivel<br>${currentLevel}</div>
    <div class="stat-card">Lecciones<br>${currentTopic.lessons.length}</div>
    <div class="stat-card">Errores<br>${mistakes}</div>
    <div class="stat-card">Progreso<br>${percent}%</div>
  `;

  saveTopicProgress(currentTopic.id, percent);
  speakEnglish('Congratulations! You finished the lesson.');
}

function restartTopic() {
  currentIndex = 0;
  score = 0;
  mistakes = 0;
  selectedAnswered = false;
  showLesson();
}

function saveTopicProgress(topicId, percent) {
  const key = 'englishAppProgress';
  const saved = JSON.parse(localStorage.getItem(key)) || {};

  if (!saved[currentLevel]) saved[currentLevel] = {};

  const oldPercent = saved[currentLevel][topicId] || 0;
  saved[currentLevel][topicId] = Math.max(oldPercent, percent);
  localStorage.setItem(key, JSON.stringify(saved));
}

function loadProgressBadge() {
  const key = 'englishAppProgress';
  const saved = JSON.parse(localStorage.getItem(key)) || {};
  const levelProgress = saved[currentLevel] || {};
  const topics = appData[currentLevel].topics;

  let total = 0;
  topics.forEach(topic => total += levelProgress[topic.id] || 0);

  const percent = topics.length ? Math.round(total / topics.length) : 0;
  document.getElementById('savedProgressBadge').textContent = 'Progreso: ' + percent + '%';
}

function shuffleArray(array) {
  const copy = array;
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
