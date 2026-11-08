/* ==========================================================================
   NON-ZERO-SUM PORTFOLIO SCRIPT
   Interactive features matching nonzerosum.games
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 2. Project card deck (drag / arrows / dots)
  initCardDeck();

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

/* --- Project Card Deck --- */
function initCardDeck() {
  const deck = document.getElementById('cardDeck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll('.deck-card')];
  const dots = document.getElementById('deckDots');
  const n = cards.length;
  let active = 0;

  const dotButtons = cards.map((card, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Show project ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dots.appendChild(b);
    return b;
  });

  function render() {
    cards.forEach((card, i) => {
      // shortest signed distance from the active card, wrapping around
      let pos = ((i - active) % n + n) % n;
      if (pos > n / 2) pos -= n;
      card.dataset.pos = Math.max(-2, Math.min(2, pos));
      card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
      card.querySelector('a').tabIndex = pos === 0 ? 0 : -1;
    });
    dotButtons.forEach((b, i) => b.setAttribute('aria-current', i === active ? 'true' : 'false'));
  }

  function go(i) {
    active = ((i % n) + n) % n;
    render();
  }

  document.getElementById('deckPrev').addEventListener('click', () => go(active - 1));
  document.getElementById('deckNext').addEventListener('click', () => go(active + 1));
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    if (e.key === 'ArrowRight') go(active + 1);
  });

  // Drag / swipe: the front card follows the pointer, release past 60px to switch
  let startX = 0, dx = 0, dragging = false, moved = false;
  deck.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = false; startX = e.clientX; dx = 0;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) > 6 && !moved) { moved = true; deck.classList.add('dragging'); }
    if (moved) {
      const front = cards[active];
      front.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`;
    }
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    deck.classList.remove('dragging');
    cards[active].style.transform = '';
    if (moved && Math.abs(dx) > 60) go(active + (dx < 0 ? 1 : -1));
    setTimeout(() => { moved = false; }, 0); // after the trailing click has been swallowed
  });

  // Capture clicks: swallow the click that ends a drag; a side card comes to the front instead of opening
  deck.addEventListener('click', (e) => {
    const card = e.target.closest('.deck-card');
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
    if (card && card.dataset.pos !== '0') {
      e.preventDefault(); e.stopPropagation();
      go(cards.indexOf(card));
    }
  }, true);

  render();
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
