(function(){
  var INPUT_SELECTOR = 'input:not([type="hidden"]):not([type="file"]):not([type="password"]), textarea';

  function norm(value){
    return String(value || '')
      .replace(/\s+/g, ' ')
      .replace(/\*/g, '')
      .trim()
      .toLowerCase();
  }

  function digits(value){
    return String(value || '').replace(/\D/g, '');
  }

  function labelText(input){
    var directLabel = input.closest('label');
    if (directLabel) return directLabel.textContent;
    var field = input.closest('.field');
    if (field) {
      var label = field.querySelector(':scope > label, label');
      if (label) return label.textContent;
    }
    return input.getAttribute('aria-label') || input.getAttribute('placeholder') || '';
  }

  function kindFor(input){
    if (!input || input.tagName === 'TEXTAREA') return '';
    var label = norm(labelText(input));
    var placeholder = norm(input.getAttribute('placeholder'));
    var type = norm(input.getAttribute('type'));

    if (input.closest('.money')) return 'money';
    if (input.hasAttribute('data-phone-format') || type === 'tel' || /\b(phone|cell|contact number)\b/.test(label)) return 'phone';
    if (/social security number|\bssn\b/.test(label) || placeholder.indexOf('123-45-6789') !== -1) return 'ssn';
    if (/\bzip( code)?\b/.test(label)) return 'zip';
    if (/email/.test(label) || placeholder.indexOf('you@email') !== -1 || type === 'email') return 'email';
    if (/ein\b/.test(label)) return 'ein';
    if (/date of birth|\bdob\b/.test(label) || placeholder.indexOf('mm / dd / yyyy') !== -1) return 'date-full';
    if (placeholder.indexOf('mm / yyyy') !== -1 || /^date$/.test(label) || / date$/.test(label) || /date of /.test(label)) return 'date-month';
    if (/^year$/.test(label)) return 'year';
    if (/\bage\b/.test(label)) return 'integer';
    if (/mileage/.test(label)) return 'integer-comma';
    return '';
  }

  function setAttr(input, name, value){
    if (!input.hasAttribute(name)) input.setAttribute(name, value);
  }

  function enhanceInput(input){
    var kind = kindFor(input);
    if (!kind || input.__mclDataIntakeEnhanced === kind) return;
    input.__mclDataIntakeEnhanced = kind;
    input.setAttribute('data-intake-kind', kind);

    if (kind === 'phone') {
      try { input.type = 'tel'; } catch(e) {}
      setAttr(input, 'inputmode', 'tel');
      setAttr(input, 'autocomplete', 'tel');
      setAttr(input, 'placeholder', '(202) 507-9145');
    } else if (kind === 'ssn') {
      setAttr(input, 'inputmode', 'numeric');
      setAttr(input, 'autocomplete', 'off');
      setAttr(input, 'maxlength', '11');
      setAttr(input, 'placeholder', '123-45-6789');
    } else if (kind === 'zip') {
      setAttr(input, 'inputmode', 'numeric');
      setAttr(input, 'autocomplete', 'postal-code');
      setAttr(input, 'maxlength', '10');
    } else if (kind === 'email') {
      try { input.type = 'email'; } catch(e) {}
      setAttr(input, 'inputmode', 'email');
      setAttr(input, 'autocomplete', 'email');
    } else if (kind === 'date-full') {
      setAttr(input, 'inputmode', 'numeric');
      setAttr(input, 'maxlength', '14');
      setAttr(input, 'placeholder', 'MM / DD / YYYY');
    } else if (kind === 'date-month') {
      setAttr(input, 'inputmode', 'numeric');
      setAttr(input, 'maxlength', '9');
      setAttr(input, 'placeholder', 'MM / YYYY');
    } else if (kind === 'money') {
      setAttr(input, 'inputmode', 'decimal');
      setAttr(input, 'autocomplete', 'off');
    } else if (kind === 'integer' || kind === 'integer-comma' || kind === 'year' || kind === 'ein') {
      setAttr(input, 'inputmode', 'numeric');
      setAttr(input, 'autocomplete', 'off');
    }

    applyFormat(input, false);
  }

  function clamp(value, min, max){
    var n = parseInt(value, 10);
    if (!Number.isFinite(n)) return value;
    return String(Math.max(min, Math.min(max, n))).padStart(2, '0');
  }

  function formatPhone(value){
    var d = digits(value);
    if (d.length > 10 && d.charAt(0) === '1') d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length < 1) return '';
    if (d.length < 4) return '(' + d;
    if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }

  function formatSsn(value){
    var d = digits(value).slice(0, 9);
    if (d.length < 4) return d;
    if (d.length < 6) return d.slice(0, 3) + '-' + d.slice(3);
    return d.slice(0, 3) + '-' + d.slice(3, 5) + '-' + d.slice(5);
  }

  function formatZip(value){
    var d = digits(value).slice(0, 9);
    if (d.length <= 5) return d;
    return d.slice(0, 5) + '-' + d.slice(5);
  }

  function formatEin(value){
    var d = digits(value).slice(0, 9);
    if (d.length <= 2) return d;
    return d.slice(0, 2) + '-' + d.slice(2);
  }

  function formatFullDate(value){
    var d = digits(value).slice(0, 8);
    if (d.length <= 2) return d;
    var mm = clamp(d.slice(0, 2), 1, 12);
    if (d.length <= 4) return mm + ' / ' + d.slice(2);
    var dd = clamp(d.slice(2, 4), 1, 31);
    return mm + ' / ' + dd + ' / ' + d.slice(4);
  }

  function formatMonthYear(value){
    var d = digits(value).slice(0, 6);
    if (d.length <= 2) return d;
    return clamp(d.slice(0, 2), 1, 12) + ' / ' + d.slice(2);
  }

  function addCommas(value){
    var d = digits(value);
    if (!d) return '';
    return String(parseInt(d, 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatMoney(value){
    var cleaned = String(value || '').replace(/[^\d.]/g, '');
    if (!cleaned) return '';
    var parts = cleaned.split('.');
    var whole = parts.shift() || '';
    whole = whole.replace(/^0+(?=\d)/, '');
    var result = whole ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
    if (cleaned.indexOf('.') !== -1) result += '.' + parts.join('').slice(0, 2);
    return result;
  }

  function formatForKind(kind, value, finalPass){
    if (kind === 'phone') return formatPhone(value);
    if (kind === 'ssn') return formatSsn(value);
    if (kind === 'zip') return formatZip(value);
    if (kind === 'ein') return formatEin(value);
    if (kind === 'date-full') return formatFullDate(value);
    if (kind === 'date-month') return formatMonthYear(value);
    if (kind === 'money') return formatMoney(value);
    if (kind === 'integer-comma') return addCommas(value);
    if (kind === 'integer') return digits(value).slice(0, 3);
    if (kind === 'year') return digits(value).slice(0, 4);
    if (kind === 'email' && finalPass) return String(value || '').trim().toLowerCase();
    return value;
  }

  function applyFormat(input, finalPass){
    var kind = kindFor(input);
    if (!kind) return;
    var next = formatForKind(kind, input.value, finalPass);
    if (input.value !== next) input.value = next;
  }

  function enhanceAll(root){
    (root || document).querySelectorAll(INPUT_SELECTOR).forEach(enhanceInput);
  }

  document.addEventListener('input', function(event){
    var input = event.target && event.target.matches && event.target.matches(INPUT_SELECTOR) ? event.target : null;
    if (!input) return;
    enhanceInput(input);
    applyFormat(input, false);
  }, true);

  document.addEventListener('focusout', function(event){
    var input = event.target && event.target.matches && event.target.matches(INPUT_SELECTOR) ? event.target : null;
    if (!input) return;
    enhanceInput(input);
    applyFormat(input, true);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ enhanceAll(document); });
  } else {
    enhanceAll(document);
  }

  if (window.MutationObserver) {
    new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        mutation.addedNodes.forEach(function(node){
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(INPUT_SELECTOR)) enhanceInput(node);
          if (node.querySelectorAll) enhanceAll(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
