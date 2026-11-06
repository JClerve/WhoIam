/* ==========================================================================
   NON-ZERO-SUM PORTFOLIO SCRIPT
   Interactive features matching nonzerosum.games
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial dark mode sync
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    if (localStorage.getItem('darkMode') === 'enabled') {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
    }
    darkModeToggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode', darkModeToggle.checked);
      localStorage.setItem('darkMode', darkModeToggle.checked ? 'enabled' : 'disabled');
    });
  }

  // 2. Non-Zero-Sum Scroll Scale Effect (from nonzerosum.games)
  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const center = windowHeight / 2;

    document.querySelectorAll('.image-item').forEach((item) => {
      const bounds = item.getBoundingClientRect();
      const itemCenter = bounds.top + bounds.height / 2;
      const distanceToCenter = Math.abs(center - itemCenter);

      // Smooth scale calculation based on distance to viewport center
      const scale = Math.min(Math.max(0.94 + (1 - distanceToCenter / center) * 0.08, 0.94), 1.02);
      item.style.transform = `scale(${scale})`;
    });
  });

  // 3. Menu Peek / Breathing cycle (if not loaded via menu.html)
  (function initMenuBreathing() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const menu = document.querySelector('.menuColumn');
    const links = menu ? [...menu.querySelectorAll('.menu-link')] : [];
    if (links.length < 2) return;

    const SHOWN = 2000;
    const GAP = 3800;
    let timer = 0, showing = null, hovering = false;

    const hide = () => { if (showing) { showing.classList.remove('peek'); showing = null; } };
    const stop = () => { clearTimeout(timer); timer = 0; hide(); };

    function schedule(delay) {
      clearTimeout(timer);
      timer = setTimeout(step, delay);
    }

    function step() {
      if (hovering || document.hidden) return schedule(GAP);
      let next = showing;
      while (next === showing) next = links[Math.floor(Math.random() * links.length)];
      showing = next;
      showing.classList.add('peek');
      timer = setTimeout(() => { hide(); schedule(GAP); }, SHOWN);
    }

    menu.addEventListener('pointerenter', () => { hovering = true; stop(); });
    menu.addEventListener('pointerleave', () => { hovering = false; schedule(GAP); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (!hovering) schedule(GAP);
    });

    schedule(1600);
  })();

  // 4. Hero Canvas Animation - Non-Zero-Sum Connected Nodes & Mascot
  initHeroCanvas();

  // 5. Game Theory Arcade Simulator (Prisoner's Dilemma)
  initGameTheoryArcade();

  // 6. Project Modal Handlers
  initProjectModals();
});

/* --- Hero Canvas Animation --- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Floating nodes representing collaborative systems
  const nodes = Array.from({ length: 18 }, () => ({
    x: Math.random() * (width || 400),
    y: Math.random() * (height || 200),
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    radius: Math.random() * 3 + 3,
  }));

  let mouse = { x: -100, y: -100 };
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -100;
    mouse.y = -100;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines between nodes (cooperation networks)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 90) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * (1 - dist / 90)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      // Mouse attraction
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 70) {
        n.x += (dx / dist) * 0.8;
        n.y += (dy / dist) * 0.8;
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Friendly mascot doodle face in center
    const cx = width / 2;
    const cy = height / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '22px MoreSugar, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('{ 1 + 1 > 2 }', cx, cy + 8);

    requestAnimationFrame(draw);
  }
  draw();
}

/* --- Interactive Game Theory Simulator --- */
function initGameTheoryArcade() {
  const btnCooperate = document.getElementById('btnCooperate');
  const btnDefect = document.getElementById('btnDefect');
  const btnReset = document.getElementById('btnResetArcade');
  const opponentSelect = document.getElementById('opponentStrategy');
  const playerScoreElem = document.getElementById('playerScore');
  const botScoreElem = document.getElementById('botScore');
  const roundLog = document.getElementById('roundLog');

  if (!btnCooperate) return;

  let playerScore = 0;
  let botScore = 0;
  let round = 0;
  let history = []; // array of { player, bot }
  let grimTriggered = false;

  function getBotMove(strategy) {
    if (strategy === 'always_cooperate') return 'C';
    if (strategy === 'always_defect') return 'D';
    if (strategy === 'random') return Math.random() > 0.5 ? 'C' : 'D';
    if (strategy === 'grim_trigger') {
      if (grimTriggered) return 'D';
      return 'C';
    }
    // Default: Tit-for-Tat
    if (history.length === 0) return 'C';
    return history[history.length - 1].player;
  }

  function playRound(playerMove) {
    const strategy = opponentSelect ? opponentSelect.value : 'tit_for_tat';
    const botMove = getBotMove(strategy);

    if (playerMove === 'D') grimTriggered = true;

    round++;
    let pPoints = 0, bPoints = 0;
    let outcomeText = '';
    let cellId = '';

    // Clear previous cell highlight
    document.querySelectorAll('#payoffTable td').forEach(td => td.style.backgroundColor = '');

    if (playerMove === 'C' && botMove === 'C') {
      // Mutual cooperation (Win-Win)
      pPoints = 3; bPoints = 3;
      outcomeText = 'Win-Win! Mutual Cooperation (+3 each)';
      cellId = 'cell-cc';
    } else if (playerMove === 'C' && botMove === 'D') {
      // Player sucker's payoff
      pPoints = 0; bPoints = 5;
      outcomeText = 'Exploited! Opponent defected (+0 vs +5)';
      cellId = 'cell-cd';
    } else if (playerMove === 'D' && botMove === 'C') {
      // Player tempt
      pPoints = 5; bPoints = 0;
      outcomeText = 'Temptation! You defected (+5 vs +0)';
      cellId = 'cell-dc';
    } else {
      // Mutual defection (Lose-Lose)
      pPoints = 1; bPoints = 1;
      outcomeText = 'Lose-Lose! Mutual defection (+1 each)';
      cellId = 'cell-dd';
    }

    playerScore += pPoints;
    botScore += bPoints;
    history.push({ player: playerMove, bot: botMove });

    if (playerScoreElem) playerScoreElem.textContent = playerScore;
    if (botScoreElem) botScoreElem.textContent = botScore;

    const highlightCell = document.getElementById(cellId);
    if (highlightCell) {
      highlightCell.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
      setTimeout(() => {
        highlightCell.style.backgroundColor = '';
      }, 1200);
    }

    if (roundLog) {
      const entry = document.createElement('div');
      entry.style.fontSize = '0.9rem';
      entry.style.margin = '4px 0';
      entry.innerHTML = `<strong>R${round}:</strong> You [${playerMove}] - Bot [${botMove}] ➔ <em>${outcomeText}</em>`;
      roundLog.prepend(entry);
    }
  }

  btnCooperate.addEventListener('click', () => playRound('C'));
  btnDefect.addEventListener('click', () => playRound('D'));

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      playerScore = 0;
      botScore = 0;
      round = 0;
      history = [];
      grimTriggered = false;
      if (playerScoreElem) playerScoreElem.textContent = '0';
      if (botScoreElem) botScoreElem.textContent = '0';
      if (roundLog) roundLog.innerHTML = '<em>Make a move to start the tournament!</em>';
    });
  }
}

/* --- Project Modals --- */
const projectData = {
  rag: {
    title: 'Enterprise RAG Assistant',
    subtitle: 'Python, OpenAI API, LangChain, ChromaDB, FastAPI, Docker',
    desc: 'RAG-based question answering system for document-level QA over large-scale knowledge bases.',
    highlights: [
      'Ingestion pipeline with preprocessing, chunking, embeddings, and vector indexing',
      'Semantic search with vector embeddings to improve relevance of retrieved context',
      'Source-grounded generation to reduce hallucinations and improve LLM reliability',
      'Scalable REST APIs with FastAPI, containerized with Docker'
    ],
    github: 'https://github.com/JClerve/Enterprise-RAG-Assistant'
  },
  demopay: {
    title: 'DemoPAY - Modular Payment Backend',
    subtitle: 'C#, .NET 10, PostgreSQL, Stripe SDK, Docker, GitHub Actions',
    desc: 'Locally runnable modular-monolith payment backend with separate Payments, Ledger, and Reconciliation persistence contexts.',
    highlights: [
      'Stripe PaymentIntents with authenticated webhook evidence as the authority for completion',
      'Idempotent ledger operations with balanced, immutable postings',
      'Durable webhook receipt handling and retryable background workers',
      'Operator API auth, health/readiness checks, and acceptance tests using the real Stripe SDK'
    ],
    github: 'https://github.com/JClerve/Modular-Payment'
  },
  dentalcare: {
    title: 'DentalCare - Clinic Management Platform',
    subtitle: 'Spring Boot 3, gRPC, Kafka, PostgreSQL, React, Tailwind CSS, Docker',
    desc: 'Microservices-based healthcare platform for appointment booking, patient management, and clinic operations.',
    highlights: [
      'BFF architecture with gRPC communication for modularity and scalability',
      'Kafka for event-driven, asynchronous processing across services',
      'Containerized services with CI/CD pipelines for streamlined deployment'
    ],
    github: 'https://github.com/JClerve/DentalCare'
  },
  research: {
    title: 'Dental Caries Detection in Mixed Dentition',
    subtitle: 'Adapting Foundation Models Using Dual-View Co-Training',
    desc: 'Dual-view AI framework for automated dental caries detection in pediatric mixed-dentition panoramic OPG images.',
    highlights: [
      'Global-View Screening with ResNet-50 FPN and Faster R-CNN for high-recall candidate regions',
      'Local-View Tooth-Level Inspection with Mask R-CNN segmentation and lesion verification',
      'DINOv2 foundation model features with SVM classification',
      'Dual-view co-training combining global anatomical context with tooth-level detail'
    ],
    github: 'https://github.com/JClerve'
  },
  zscore: {
    title: 'Z-Score Prediction Web Application',
    subtitle: 'Python, FastAPI, XGBoost, React, Vite, REST APIs',
    desc: 'XGBoost regression model served through FastAPI with a React frontend.',
    highlights: [
      'Low-latency predictions from an XGBoost model via FastAPI',
      'Preprocessing and validation pipelines for structured input features',
      'React frontend for data collection and user interaction'
    ],
    github: 'https://github.com/JClerve/ML--Assignment'
  }
};

function initProjectModals() {
  const modalOverlay = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalHighlights = document.getElementById('modalHighlights');
  const modalGithub = document.getElementById('modalGithub');

  if (!modalOverlay) return;

  document.querySelectorAll('[data-project]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pKey = btn.getAttribute('data-project');
      const data = projectData[pKey];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalSubtitle.textContent = data.subtitle;
      modalDesc.textContent = data.desc;
      modalHighlights.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');
      if (modalGithub) modalGithub.href = data.github;

      modalOverlay.classList.add('active');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modalOverlay.classList.remove('active');
  });
}
