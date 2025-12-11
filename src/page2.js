// ===== page2.js - 문장제 나눗셈 문제 풀이 =====

// API Key 가져오기 (Vite 환경변수)
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ===== 전역 변수 =====
let currentLevel = -1;         // 현재 선택된 레벨 (-1: 미선택)
let currentProblem = null;     // 현재 문제 데이터 { question, answer, hint }
let isDrawing = false;
let currentTool = 'pencil';    // 'pencil' | 'eraser'
let currentColor = '#000000';

// ===== 레벨별 설정 =====
const LEVEL_CONFIG = [
  { 
    name: '(몇십)÷(몇) (1)',
    dividendMin: 10, dividendMax: 90, divisorMin: 2, divisorMax: 9,
    description: '10~90 사이의 10의 배수를 한 자리 수(2~9)로 나누어 떨어지는',
    mustBeTen: true
  },
  { 
    name: '(몇십)÷(몇) (2)',
    dividendMin: 10, dividendMax: 90, divisorMin: 2, divisorMax: 9,
    description: '10~90 사이의 10의 배수를 한 자리 수(2~9)로 나누는 (나머지 있을 수 있음)',
    mustBeTen: true
  },
  { 
    name: '(몇십몇)÷(몇) (1)',
    dividendMin: 10, dividendMax: 99, divisorMin: 2, divisorMax: 9,
    description: '10~99 사이의 두 자리 수를 한 자리 수(2~9)로 나누어 떨어지는',
    mustBeTen: false
  },
  { 
    name: '(몇십몇)÷(몇) (2)',
    dividendMin: 10, dividendMax: 99, divisorMin: 2, divisorMax: 9,
    description: '10~99 사이의 두 자리 수를 한 자리 수(2~9)로 나누는',
    mustBeTen: false
  },
  { 
    name: '(세 자리 수)÷(한 자리 수) (1)',
    dividendMin: 100, dividendMax: 999, divisorMin: 2, divisorMax: 9,
    description: '100~999 사이의 세 자리 수를 한 자리 수(2~9)로 나누어 떨어지는',
    mustBeTen: false
  },
  { 
    name: '(세 자리 수)÷(한 자리 수) (2)',
    dividendMin: 100, dividendMax: 999, divisorMin: 2, divisorMax: 9,
    description: '100~999 사이의 세 자리 수를 한 자리 수(2~9)로 나누는',
    mustBeTen: false
  }
];

// ===== Fallback 문제 (API 실패 시 사용) =====
const FALLBACK_PROBLEMS = [
  [
    { question: "사탕 30개를 3명의 친구에게 똑같이 나누어 주려고 합니다. 한 명에게 몇 개씩 줄 수 있을까요?", answer: 10, remainder: 0, hint: "30을 3으로 나누어 보세요." },
    { question: "연필 40자루를 5명이 똑같이 나누어 가집니다. 한 명당 몇 자루씩 가질 수 있나요?", answer: 8, remainder: 0, hint: "40 ÷ 5를 계산해 보세요." }
  ],
  [
    { question: "구슬 50개를 6개의 상자에 똑같이 나누어 담으려고 합니다. 한 상자에 몇 개씩 담을 수 있고, 나머지는 몇 개인가요?", answer: 8, remainder: 2, hint: "50 ÷ 6의 몫과 나머지를 구해보세요." },
    { question: "풍선 70개를 8명에게 똑같이 나누어 줍니다. 한 명당 몇 개씩 받고, 나머지는 몇 개인가요?", answer: 8, remainder: 6, hint: "70 ÷ 8을 계산해 보세요." }
  ],
  [
    { question: "색종이 36장을 4명이 똑같이 나누어 가집니다. 한 명이 몇 장씩 가질 수 있나요?", answer: 9, remainder: 0, hint: "36 ÷ 4를 계산해 보세요." },
    { question: "쿠키 48개를 6개의 접시에 똑같이 담습니다. 한 접시에 몇 개씩 담을 수 있나요?", answer: 8, remainder: 0, hint: "48을 6으로 나누어 보세요." }
  ],
  [
    { question: "사과 57개를 7명이 똑같이 나누어 가집니다. 한 명당 몇 개씩 가지고, 나머지는 몇 개인가요?", answer: 8, remainder: 1, hint: "57 ÷ 7의 몫과 나머지를 구해보세요." },
    { question: "도넛 65개를 8개의 상자에 나누어 담습니다. 한 상자에 몇 개씩 담고, 나머지는 몇 개인가요?", answer: 8, remainder: 1, hint: "65 ÷ 8을 계산해 보세요." }
  ],
  [
    { question: "초콜릿 126개를 3명의 친구에게 똑같이 나누어 줍니다. 한 명에게 몇 개씩 줄 수 있나요?", answer: 42, remainder: 0, hint: "126 ÷ 3을 세로셈으로 계산해 보세요." },
    { question: "연필 248자루를 4개의 필통에 똑같이 나누어 담습니다. 한 필통에 몇 자루씩 담나요?", answer: 62, remainder: 0, hint: "248 ÷ 4를 계산해 보세요." }
  ],
  [
    { question: "스티커 357장을 7명에게 똑같이 나누어 줍니다. 한 명당 몇 장씩 받을 수 있나요?", answer: 51, remainder: 0, hint: "357 ÷ 7을 세로셈으로 풀어보세요." },
    { question: "구슬 523개를 9개의 주머니에 똑같이 나누어 담습니다. 한 주머니에 몇 개씩 담고, 나머지는 몇 개인가요?", answer: 58, remainder: 1, hint: "523 ÷ 9의 몫과 나머지를 구해보세요." }
  ]
];

// ===== 초기화 =====
function init() {
  checkApiKey();
  setupEventListeners();
  setupCanvas();
}

// ===== API Key 확인 =====
function checkApiKey() {
  const statusBar = document.getElementById('statusBar');
  if (API_KEY && API_KEY !== 'undefined' && API_KEY.trim() !== '') {
    statusBar.className = 'status-bar connected';
    statusBar.innerHTML = '<span>🟢</span> AI 선생님과 연결되었습니다';
  } else {
    statusBar.className = 'status-bar disconnected';
    statusBar.innerHTML = '<span>🔴</span> API Key를 찾을 수 없습니다 (.env 파일에 VITE_OPENAI_API_KEY 설정 필요)';
  }
}

// ===== 이벤트 리스너 설정 =====
function setupEventListeners() {
  // 레벨 선택 버튼
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentLevel = parseInt(this.dataset.level);
      generateNewProblem();
    });
  });

  // 정답 확인 버튼
  document.getElementById('checkBtn').addEventListener('click', checkAnswer);

  // 엔터 키로 정답 확인
  document.getElementById('quotientInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });
  
  document.getElementById('remainderInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });

  // 도구 버튼들
  document.getElementById('pencilBtn').addEventListener('click', function() {
    currentTool = 'pencil';
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });

  document.getElementById('eraserBtn').addEventListener('click', function() {
    currentTool = 'eraser';
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });

  // 색상 선택
  document.getElementById('colorPicker').addEventListener('input', function() {
    currentColor = this.value;
    currentTool = 'pencil';
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('pencilBtn').classList.add('active');
  });
}

// ===== 문제 생성 함수 (메인) =====
window.generateNewProblem = async function() {
  if (currentLevel < 0) {
    alert('먼저 공부할 유형을 선택해 주세요!');
    return;
  }

  resetUI();
  showLoading(true);

  try {
    if (API_KEY && API_KEY !== 'undefined' && API_KEY.trim() !== '') {
      currentProblem = await generateProblemAI(currentLevel);
    } else {
      console.log('API 키가 설정되지 않아 기본 문제를 사용합니다.');
      currentProblem = getRandomFallbackProblem(currentLevel);
    }
  } catch (error) {
    console.error('문제 생성 실패:', error);
    currentProblem = getRandomFallbackProblem(currentLevel);
  }

  showLoading(false);
  displayProblem(currentProblem);
  enableAnswerInput();
}

// ===== OpenAI API 호출 함수 =====
async function generateProblemAI(levelIndex) {
  const config = LEVEL_CONFIG[levelIndex];
  
  const prompt = `당신은 초등학교 3학년 수학 선생님입니다.
${config.description} 나눗셈 문장제 문제를 1개 만들어주세요.

조건:
- 나누어지는 수(피제수): ${config.dividendMin} ~ ${config.dividendMax}
- 나누는 수(제수): ${config.divisorMin} ~ ${config.divisorMax}
${config.mustBeTen ? '- 피제수는 반드시 10의 배수여야 합니다.' : ''}
${levelIndex % 2 === 0 ? '- 나누어 떨어지는 문제로 만들어주세요.' : '- 나머지가 있어도 됩니다. 답은 몫만 구하면 됩니다.'}
- 초등학생이 이해하기 쉬운 실생활 소재(사탕, 연필, 색종이, 과일 등)를 사용해주세요.
- 문장은 친근하고 쉬운 말로 작성해주세요.

반드시 아래 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 JSON만 출력하세요:
{"question": "문제 내용", "answer": 정답숫자, "hint": "틀렸을 때 보여줄 힌트"}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '당신은 초등학교 수학 문제를 만드는 선생님입니다. JSON 형식으로만 응답합니다.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('JSON 형식이 아닙니다');
  } catch (e) {
    console.error('JSON 파싱 실패:', content);
    throw e;
  }
}

// ===== Fallback 문제 가져오기 =====
function getRandomFallbackProblem(levelIndex) {
  const problems = FALLBACK_PROBLEMS[levelIndex];
  const randomIndex = Math.floor(Math.random() * problems.length);
  return { ...problems[randomIndex] };
}

// ===== 문제 표시 =====
function displayProblem(problem) {
  const problemText = document.getElementById('problemText');
  problemText.textContent = problem.question;
}

// ===== 로딩 표시 =====
function showLoading(isLoading) {
  const problemBox = document.getElementById('problemBox');
  if (isLoading) {
    problemBox.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-text">AI 선생님이 문제를 만들고 있어요...</p>
    `;
  }
}

// ===== 정답 입력 활성화 =====
function enableAnswerInput() {
  document.getElementById('quotientInput').value = '';
  document.getElementById('remainderInput').value = '';
  document.getElementById('quotientInput').focus();
}

// ===== UI 초기화 =====
function resetUI() {
  document.getElementById('quotientInput').value = '';
  document.getElementById('remainderInput').value = '';
  document.getElementById('feedbackContent').textContent = '문제를 풀고 정답을 확인해 보세요!';
  document.getElementById('feedbackContent').className = 'feedback-content';
  
  const hintBox = document.querySelector('.feedback-hint');
  if (hintBox) hintBox.remove();
}

// ===== 정답 확인 =====
function checkAnswer() {
  if (!currentProblem) {
    alert('먼저 문제를 생성해 주세요!');
    return;
  }

  const userQuotient = parseInt(document.getElementById('quotientInput').value);
  const userRemainder = parseInt(document.getElementById('remainderInput').value) || 0;
  const feedbackContent = document.getElementById('feedbackContent');
  const feedbackBox = document.getElementById('feedbackBox');

  if (isNaN(userQuotient)) {
    alert('몫을 입력해 주세요!');
    return;
  }

  const existingHint = feedbackBox.querySelector('.feedback-hint');
  if (existingHint) existingHint.remove();

  // 정답의 나머지 계산 (문제에 remainder가 없으면 0으로 처리)
  const correctRemainder = currentProblem.remainder !== undefined ? currentProblem.remainder : 0;
  
  const quotientCorrect = userQuotient === currentProblem.answer;
  const remainderCorrect = userRemainder === correctRemainder;

  if (quotientCorrect && remainderCorrect) {
    feedbackContent.textContent = '참 잘했어요! 🎉 정답이에요!';
    feedbackContent.className = 'feedback-content feedback-correct';
    showConfetti();
  } else if (quotientCorrect && !remainderCorrect) {
    feedbackContent.textContent = '몫은 맞았어요! 나머지를 다시 확인해 볼까요?';
    feedbackContent.className = 'feedback-content feedback-wrong';
  } else if (!quotientCorrect && remainderCorrect) {
    feedbackContent.textContent = '나머지는 맞았어요! 몫을 다시 확인해 볼까요?';
    feedbackContent.className = 'feedback-content feedback-wrong';
    
    const hintDiv = document.createElement('div');
    hintDiv.className = 'feedback-hint';
    hintDiv.textContent = '💡 힌트: ' + currentProblem.hint;
    feedbackBox.appendChild(hintDiv);
  } else {
    feedbackContent.textContent = '아쉬워요, 다시 한번 생각해 볼까요?';
    feedbackContent.className = 'feedback-content feedback-wrong';
    
    const hintDiv = document.createElement('div');
    hintDiv.className = 'feedback-hint';
    hintDiv.textContent = '💡 힌트: ' + currentProblem.hint;
    feedbackBox.appendChild(hintDiv);
  }
}

// ===== 축하 효과 =====
function showConfetti() {
  const emojis = ['🎉', '🎊', '⭐', '🌟', '✨', '💫'];
  
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-50px';
      confetti.style.fontSize = (Math.random() * 20 + 20) + 'px';
      confetti.style.transition = 'all 2s ease-out';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.style.top = '100vh';
        confetti.style.opacity = '0';
      }, 50);
      
      setTimeout(() => confetti.remove(), 2500);
    }, i * 100);
  }
}

// ===== 캔버스 설정 =====
let canvas, ctx;

function setupCanvas() {
  canvas = document.getElementById('drawingCanvas');
  ctx = canvas.getContext('2d');
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // 마우스 이벤트
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // 터치 이벤트
  canvas.addEventListener('touchstart', startDrawing);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDrawing);
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 500;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function startDrawing(e) {
  isDrawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!isDrawing) return;
  e.preventDefault();
  
  const pos = getPos(e);
  
  if (currentTool === 'pencil') {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  } else {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

// 캔버스 초기화 (전역 함수로 노출)
window.clearCanvas = function() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 페이지 로드 시 초기화
init();

