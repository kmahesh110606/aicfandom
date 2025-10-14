
let timerInterval;
let timeLeft = 60;
let answeredCount = 0;
let selectedQuestions = [];
let gameOver = false;

function startTimer() {
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer';
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;
  document.body.appendChild(timerDisplay);

  const updateTimer = () => {
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
      gameOverScreen();
    }
    timeLeft--;
  };

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function loadQuiz(fandom) {
  try {
    document.getElementById('quiz-body').style.backgroundImage = `url('../images/${fandom}.jpg')`;
    const res = await fetch(`../data/${fandom}.json`);
    const questions = await res.json();
    selectedQuestions = shuffleArray(questions).slice(0, 10);

    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    selectedQuestions.forEach((q, index) => {
      const block = document.createElement('div');
      block.className = 'question-block';
      block.dataset.answered = 'false';
      block.dataset.correct = 'false';
      block.innerHTML = `
        <h3>Q${index + 1}: ${q.question}</h3>
        <div id="options-${index}" class="d-grid gap-2"></div>
      `;
      container.appendChild(block);

      const optionsContainer = document.getElementById(`options-${index}`);
      const shuffledOptions = shuffleArray([...q.options]);

      shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-light text-start col-6 meh';
        btn.textContent = opt;
        btn.onclick = () => {
          if (block.dataset.answered === 'true' || gameOver) return;
          block.dataset.answered = 'true';
          answeredCount++;

          if (opt === q.answer) {
            btn.classList.remove('btn-outline-light');
            btn.classList.add('btn-success');
            block.dataset.correct = 'true';
          } else {
            btn.classList.remove('btn-outline-light');
            btn.classList.add('btn-danger');
            [...optionsContainer.children].forEach(b => {
              if (b.textContent === q.answer) {
                b.classList.remove('btn-outline-light');
                b.classList.add('btn-success');
              }
            });
          }

          [...optionsContainer.children].forEach(b => b.disabled = true);

          if (answeredCount === 10) {
            clearInterval(timerInterval);
            submitQuiz();
          }
        };
        optionsContainer.appendChild(btn);
      });
    });

    startTimer();

  } catch (err) {
    console.error(err);
    document.getElementById('quiz-container').innerHTML = 'Failed to load quiz.';
  }
}

function submitQuiz() {
  if (gameOver) return;
  const questions = document.querySelectorAll('.question-block');
  let score = 0;

  questions.forEach(block => {
    if (block.dataset.correct === 'true') {
      score++;
    }
  });

  const scoreBox = document.createElement('div');
  scoreBox.id = 'score-box';

  let emoji = '';
  if (score === 10) {
    emoji = '🎉';
    launchConfetti();
  } else if (score === 0) {
    emoji = '😢';
  } else if (score >= 1 && score <= 5) {
    emoji = '👍';
  } else if (score >= 6 && score < 10) {
    emoji = '😊';
  }

  scoreBox.innerHTML = `<strong>Score: ${score} / 10 ${emoji}</strong>`;
  document.getElementById('quiz-container').appendChild(scoreBox);
  gameOver = true;
}

function gameOverScreen() {
  document.body.style.overflow = 'hidden';
  document.getElementById('quiz-container').style.filter = 'blur(5px)';
  const overlay = document.createElement('div');
  overlay.id = 'game-over';
  overlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-75 text-white';
  overlay.innerHTML = `
    <div class="text-center p-4 rounded">
      <h2 class="text-danger">⏱️ Time's up!</h2>
      <div id="final-score"></div>
      <button class="btn btn-light mt-3" onclick="location.reload()">Try Again</button>
    </div>
  `;
  document.body.appendChild(overlay);
  const finalScore = document.getElementById('score-box')?.innerHTML || '';
  document.getElementById('final-score').innerHTML = finalScore;
}

function launchConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '9999';

  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.top = `${Math.random() * 100}%`;
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
    confetti.style.opacity = '0.8';
    confetti.style.borderRadius = '50%';
    confettiContainer.appendChild(confetti);
  }

  document.body.appendChild(confettiContainer);

  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fall {
      to {
        transform: translateY(100vh);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

if (typeof fandom !== 'undefined') {
  loadQuiz(fandom);
}
