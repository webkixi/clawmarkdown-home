(function () {
  'use strict';

  // ========== 导航栏滚动效果 ==========
  var navbar = document.getElementById('navbar');
  var backTop = document.getElementById('backTop');

  function onScroll() {
    var y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 20);
    if (backTop) backTop.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ========== 移动端菜单 ==========
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
    // 点击菜单项后关闭
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // ========== 回到顶部 ==========
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== 暗色主题（跟随系统 + 本地记忆）==========
  var THEME_KEY = 'clawmark-theme';
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (savedTheme === 'dark' || savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // ========== FAQ 手风琴 ==========
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // 关闭其他
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        var otherA = other.querySelector('.faq-a');
        var otherQ = other.querySelector('.faq-q');
        if (otherA) otherA.style.maxHeight = null;
        if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ========== 滚动入场动画 ==========
  var revealEls = document.querySelectorAll(
    '.feature-card, .platform-card, .step, .depth-card, .lobster-card, .install-step, .faq-item, .section-head'
  );
  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ========== 平滑锚点滚动（兼容固定导航栏偏移）==========
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navH = navbar ? navbar.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  // ========== 动态版本号（并行竞争：两源同时请求，先到先用）==========
  var VERSION_SOURCES = [
    'https://clawmarkdown-d5g0jp60lbf2e7980-1302545684.ap-shanghai.app.tcloudbase.com/versions',
    'https://kv-manager.yyralf.workers.dev/versions'
  ];
  var DEFAULT_PLUGIN_VER = '1.0.1';
  var DEFAULT_SKILL_VER = '2.2.0';
  var VERSION_TIMEOUT = 6000; // 单源超时 6 秒

  function applyVersion(ver) {
    var pv = ver.pluginVersion || DEFAULT_PLUGIN_VER;
    var sv = ver.skillVersion || DEFAULT_SKILL_VER;
    var heroEl = document.getElementById('heroVersion');
    if (heroEl) heroEl.textContent = 'v' + pv;
    var footerEl = document.getElementById('footerVersion');
    if (footerEl) footerEl.textContent = '插件 v' + pv + ' · 技能 v' + sv;
  }

  function fetchVersion() {
    var settled = false; // 是否已确定结果（防止重复 apply）
    var failCount = 0;

    function tryApply(data) {
      if (settled) return;
      settled = true;
      if (data && (data.pluginVersion || data.skillVersion)) {
        applyVersion(data);
      } else {
        applyVersion({ pluginVersion: DEFAULT_PLUGIN_VER, skillVersion: DEFAULT_SKILL_VER });
      }
    }

    function onFail() {
      failCount++;
      if (failCount >= VERSION_SOURCES.length && !settled) {
        tryApply({ pluginVersion: DEFAULT_PLUGIN_VER, skillVersion: DEFAULT_SKILL_VER });
      }
    }

    VERSION_SOURCES.forEach(function (url) {
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, VERSION_TIMEOUT);

      fetch(url, { signal: controller.signal })
        .then(function (r) {
          clearTimeout(timer);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) { tryApply(data); })
        .catch(function () { clearTimeout(timer); onFail(); });
    });
  }
  fetchVersion();
})();
