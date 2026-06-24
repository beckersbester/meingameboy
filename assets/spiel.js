(function () {
  'use strict';

  var MEMORIZE_SEC = 5;
  var RACE_WORDS = ['Auf die Plätze…', 'Fertig…', 'Los!'];
  var RACE_MS = 900;

  var target = { r: 0, g: 0, b: 0 };
  var timerId = null;

  var el = {
    countdown: document.getElementById('spiel-countdown'),
    countdownText: document.getElementById('spiel-countdown-text'),
    memorize: document.getElementById('spiel-memorize'),
    memorizeTimer: document.getElementById('spiel-memorize-timer'),
    memorizeGb: document.getElementById('spiel-memorize-gb'),
    guess: document.getElementById('spiel-guess'),
    guessGb: document.getElementById('spiel-guess-gb'),
    guessPreview: document.getElementById('spiel-guess-preview'),
    sliderR: document.getElementById('spiel-r'),
    sliderG: document.getElementById('spiel-g'),
    sliderB: document.getElementById('spiel-b'),
    valR: document.getElementById('spiel-r-val'),
    valG: document.getElementById('spiel-g-val'),
    valB: document.getElementById('spiel-b-val'),
    confirm: document.getElementById('spiel-confirm'),
    result: document.getElementById('spiel-result'),
    score: document.getElementById('spiel-score'),
    scoreLabel: document.getElementById('spiel-score-label'),
    resultTarget: document.getElementById('spiel-result-target'),
    resultGuess: document.getElementById('spiel-result-guess'),
    resultTargetGb: document.getElementById('spiel-result-target-gb'),
    resultGuessGb: document.getElementById('spiel-result-guess-gb'),
    again: document.getElementById('spiel-again'),
    btnStart: document.getElementById('spiel-btn-start'),
    funMsg: document.getElementById('spiel-fun-msg')
  };

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function rgbStr(c) {
    return 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
  }

  function randomColor() {
    return {
      r: Math.floor(Math.random() * 181) + 40,
      g: Math.floor(Math.random() * 181) + 40,
      b: Math.floor(Math.random() * 181) + 40
    };
  }

  /** SVG-Silhouette – an Original-Grafik angepasst (viewBox 150×236) */
  function buildGbSvg() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 150 236');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', 'spiel-gb-svg');
    svg.setAttribute('aria-hidden', 'true');

    function add(tag, attrs) {
      var node = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
      svg.appendChild(node);
      return node;
    }

    /* Gehäuse – nur unten rechts abgerundet */
    add('path', {
      class: 'spiel-gb-gehaeuse',
      fill: '#cccccc',
      d: 'M0 0 H150 V214 A22 22 0 0 1 128 236 H0 Z'
    });

    /* Bildschirm-Rahmen & Display */
    add('rect', { x: '16', y: '22', width: '118', height: '74', rx: '2', fill: '#475860' });
    add('rect', { x: '38', y: '32', width: '75', height: '70', rx: '1', fill: '#9e9e24' });

    /* D-Pad */
    add('rect', { x: '34', y: '153', width: '7', height: '28', rx: '1', fill: '#475860' });
    add('rect', { x: '24', y: '164', width: '27', height: '7', rx: '1', fill: '#475860' });

    /* A / B */
    add('circle', { cx: '123', cy: '164', r: '14.5', fill: '#922850' });
    add('circle', { cx: '97', cy: '180', r: '14.5', fill: '#922850' });

    return svg;
  }

  function mountGb(container) {
    if (!container) return null;
    if (!container.querySelector('.spiel-gb-svg')) {
      container.appendChild(buildGbSvg());
    }
    return container;
  }

  function setGehaeuseColor(container, color) {
    if (!container) return;
    var gehaeuse = container.querySelector('.spiel-gb-gehaeuse');
    if (gehaeuse) gehaeuse.setAttribute('fill', rgbStr(color));
  }

  function initGbSlots() {
    mountGb(el.memorizeGb);
    mountGb(el.guessGb);
    mountGb(el.resultTargetGb);
    mountGb(el.resultGuessGb);
    setGehaeuseColor(el.memorizeGb, { r: 204, g: 204, b: 204 });
    setGehaeuseColor(el.guessGb, { r: 128, g: 128, b: 128 });
  }

  function showPhase(name) {
    ['countdown', 'memorize', 'guess', 'result'].forEach(function (p) {
      var section = el[p];
      if (section) section.hidden = p !== name;
    });
  }

  function hideAllPhases() {
    ['countdown', 'memorize', 'guess', 'result'].forEach(function (p) {
      if (el[p]) el[p].hidden = true;
    });
  }

  function clearTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function readGuess() {
    return {
      r: parseInt(el.sliderR.value, 10),
      g: parseInt(el.sliderG.value, 10),
      b: parseInt(el.sliderB.value, 10)
    };
  }

  function rgbDistance(a, b) {
    var dr = a.r - b.r;
    var dg = a.g - b.g;
    var db = a.b - b.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function scoreFromDistance(d) {
    var max = Math.sqrt(3 * 255 * 255);
    return Math.round(Math.max(0, 100 - (d / max) * 100));
  }

  function scoreLabelText(score) {
    if (score >= 95) return 'Perfekt – du hast ein Auge fürs Detail!';
    if (score >= 85) return 'Sehr gut – fast getroffen!';
    if (score >= 70) return 'Ganz ordentlich – noch Luft nach oben.';
    if (score >= 50) return 'Nicht schlecht – aber die Erinnerung trübt.';
    return 'Ups – nächste Runde wird besser!';
  }

  function funMessageText(score) {
    if (score >= 100) return 'RGB-Meister! Der Webshop-Preis ist schon 5 % günstiger – ab 2 Artikeln mit GAMEBOY5 nochmal 5 %.';
    if (score >= 85) return 'Starke Leistung! Im Webshop sparst du immer 5 % – GAMEBOY5 gibt ab 2 Artikeln extra 5 %.';
    if (score >= 60) return 'Nicht schlecht! Webshop: 5 % auf alles, schön gerundet.';
    return 'Weiter üben – oder shoppen: 5 % Webshop-Rabatt ist immer aktiv.';
  }

  function showFunResult(score) {
    if (!el.funMsg) return;
    el.funMsg.hidden = false;
    el.funMsg.textContent = funMessageText(score);
  }

  function updateSliders() {
    var c = readGuess();
    el.valR.textContent = c.r;
    el.valG.textContent = c.g;
    el.valB.textContent = c.b;
    el.guessPreview.style.backgroundColor = rgbStr(c);
    setGehaeuseColor(el.guessGb, c);
  }

  function resetSliders() {
    el.sliderR.value = 128;
    el.sliderG.value = 128;
    el.sliderB.value = 128;
    updateSliders();
  }

  async function runRaceCountdown() {
    showPhase('countdown');
    for (var i = 0; i < RACE_WORDS.length; i++) {
      el.countdownText.textContent = RACE_WORDS[i];
      el.countdownText.classList.remove('spiel-pop');
      void el.countdownText.offsetWidth;
      el.countdownText.classList.add('spiel-pop');
      await sleep(RACE_MS);
    }
  }

  function runMemorizePhase() {
    return new Promise(function (resolve) {
      showPhase('memorize');
      setGehaeuseColor(el.memorizeGb, target);

      var left = MEMORIZE_SEC;
      el.memorizeTimer.textContent = left;

      timerId = setInterval(function () {
        left -= 1;
        if (left > 0) {
          el.memorizeTimer.textContent = left;
        } else {
          clearTimer();
          resolve();
        }
      }, 1000);
    });
  }

  function showGuessPhase() {
    showPhase('guess');
    resetSliders();
  }

  function showResult() {
    var guess = readGuess();
    var dist = rgbDistance(target, guess);
    var score = scoreFromDistance(dist);

    setGehaeuseColor(el.resultTargetGb, target);
    setGehaeuseColor(el.resultGuessGb, guess);
    el.resultTarget.textContent = rgbStr(target);
    el.resultGuess.textContent = rgbStr(guess);
    el.score.textContent = score + '%';
    el.scoreLabel.textContent = scoreLabelText(score);
    el.score.className = 'spiel-score spiel-score--' + (score >= 85 ? 'high' : score >= 60 ? 'mid' : 'low');
    showFunResult(score);

    showPhase('result');
  }

  async function startGame() {
    clearTimer();
    target = randomColor();
    el.btnStart.disabled = true;

    await runRaceCountdown();
    await runMemorizePhase();
    showGuessPhase();

    el.btnStart.disabled = false;
  }

  el.btnStart.addEventListener('click', startGame);
  el.again.addEventListener('click', function () {
    if (el.funMsg) el.funMsg.hidden = true;
    hideAllPhases();
  });
  el.confirm.addEventListener('click', showResult);

  [el.sliderR, el.sliderG, el.sliderB].forEach(function (slider) {
    slider.addEventListener('input', updateSliders);
  });

  initGbSlots();
  updateSliders();
})();
