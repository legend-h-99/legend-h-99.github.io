(function () {
  'use strict';

  var PRIVATE_USE_RE = /^[\ue000-\uf8ff\s]+$/;

  function textOf(element) {
    return (element && (element.innerText || element.textContent) || '').replace(/\s+/g, ' ').trim();
  }

  function setIfMissing(element, name, value) {
    if (element && !element.getAttribute(name)) {
      element.setAttribute(name, value);
    }
  }

  function ensureHiddenHeading(id, text, level) {
    if (document.getElementById(id)) return;

    var heading = document.createElement('h' + level);
    heading.id = id;
    heading.textContent = text;
    heading.className = 'zaad-sr-only';

    var root = document.getElementById('root') || document.body;
    root.insertBefore(heading, root.firstChild);
  }

  function makeKeyboardActivatable(element) {
    if (element.__zaadA11yKeyHandler) return;

    element.__zaadA11yKeyHandler = true;
    element.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
  }

  function fixDocumentMetadata() {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    if (document.body) {
      document.body.dir = 'rtl';
    }
  }

  function fixFields() {
    var email = document.querySelector('input[type="email"], input[autocomplete="email"]');
    if (email) {
      email.id = email.id || 'login-email';
      email.setAttribute('aria-label', 'البريد الإلكتروني');
      email.setAttribute('autocomplete', 'email');
      email.setAttribute('inputmode', 'email');
      email.setAttribute('aria-required', 'true');
    }

    var password = document.querySelector('input[type="password"], input[autocomplete="password"], input[autocomplete="current-password"]');
    if (password) {
      password.id = password.id || 'login-password';
      password.setAttribute('aria-label', 'كلمة المرور');
      password.setAttribute('autocomplete', 'current-password');
      password.setAttribute('aria-required', 'true');
    }
  }

  function fixInteractiveNames() {
    Array.prototype.forEach.call(document.querySelectorAll('button'), function (button) {
      var name = textOf(button) || button.getAttribute('aria-label') || '';
      if (!name) {
        button.setAttribute('aria-label', 'عرض معلومات الخصوصية');
      }
    });

    var controls = Array.prototype.slice.call(document.querySelectorAll('[tabindex="0"], [role="button"], [role="link"]'));
    controls.forEach(function (element) {
      var label = textOf(element);

      if (label === 'نسيت كلمة المرور؟') {
        element.setAttribute('role', 'link');
        element.setAttribute('aria-label', 'استعادة كلمة المرور');
        makeKeyboardActivatable(element);
      }

      if (label.indexOf('جديد في زاد؟') !== -1 && label.indexOf('أنشئ حسابك') !== -1) {
        element.setAttribute('role', 'link');
        element.setAttribute('aria-label', 'إنشاء حساب جديد في زاد');
        makeKeyboardActivatable(element);
      }
    });
  }

  function fixHeadings() {
    ensureHiddenHeading('zaad-page-heading', 'زاد - تسجيل الدخول', 1);
    ensureHiddenHeading('zaad-demo-heading', 'جرّب أحد الحسابات', 2);

    Array.prototype.forEach.call(document.querySelectorAll('div, span'), function (element) {
      var label = textOf(element);
      if (label === 'أهلاً بعودتك') {
        setIfMissing(element, 'role', 'heading');
        setIfMissing(element, 'aria-level', '2');
      }
      if (label === 'جرّب أحد الحسابات') {
        setIfMissing(element, 'role', 'heading');
        setIfMissing(element, 'aria-level', '2');
      }
    });
  }

  function hideDecorativeIcons() {
    Array.prototype.forEach.call(document.querySelectorAll('div, span'), function (element) {
      var label = textOf(element);
      if (label && PRIVATE_USE_RE.test(label)) {
        element.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function applyFixes() {
    fixDocumentMetadata();
    fixFields();
    fixInteractiveNames();
    fixHeadings();
    hideDecorativeIcons();
  }

  function installStyles() {
    if (document.getElementById('zaad-a11y-fixes')) return;

    var style = document.createElement('style');
    style.id = 'zaad-a11y-fixes';
    style.textContent = [
      '.zaad-sr-only {',
      '  position: absolute !important;',
      '  width: 1px !important;',
      '  height: 1px !important;',
      '  padding: 0 !important;',
      '  margin: -1px !important;',
      '  overflow: hidden !important;',
      '  clip: rect(0, 0, 0, 0) !important;',
      '  white-space: nowrap !important;',
      '  border: 0 !important;',
      '}',
      'button:focus-visible,',
      'input:focus-visible,',
      '[role="button"]:focus-visible,',
      '[role="link"]:focus-visible,',
      '[tabindex="0"]:focus-visible {',
      '  outline: 3px solid #b8ee31 !important;',
      '  outline-offset: 3px !important;',
      '  box-shadow: 0 0 0 2px #385c2e !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  installStyles();
  applyFixes();

  if (window.MutationObserver) {
    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        applyFixes();
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.addEventListener('load', applyFixes);
})();
