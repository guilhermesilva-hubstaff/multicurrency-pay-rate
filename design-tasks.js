/* =============================================================
   Design Tasks — global overview of all prototype annotations
   Injects a "Design tasks" button next to the topbar timer.
   Clicking opens a modal with all pending tasks across pages,
   filterable by page pill. Clicking a task navigates to that
   page (if needed) and highlights the relevant UI area.
   ============================================================= */

(function () {
  'use strict';

  /* ── Registry ───────────────────────────────────────────────
     Single source of truth. Keep in sync with each page's
     DesignAnnotations.init() call.
  ─────────────────────────────────────────────────────────── */
  var REGISTRY = [
    {
      id: 'members',
      label: 'Members',
      href: 'members.html',
      tasks: [
        { text: 'Pay rate column — each member\'s current rate', target: '.mem-col--payrate', sub: [
          'Shows the active pay rate for every member, with the pay period (e.g. "/hr", "/mo")',
          'Sortable; sits between Work orders and Bill rate',
          'Inline edit and batch edit both write back to this column',
        ]},
        { text: 'Currency shown in the Pay rate column', target: '.mem-pay__val', sub: [
          'Each rate is displayed in the member\'s own currency — e.g. "EUR 18.00/hr", "BRL 40.00/hr"',
          'No USD conversion in the column: the rate is fixed in the member\'s currency (the USD equivalent fluctuates daily)',
          'Consistent with Team payment and Amounts owed — show the ISO code, never the "$" symbol',
        ]},
        { text: 'Batch action — Edit pay rate dialog', target: '#mem-batch-btn', sub: [
          'Select one or more members, then Batch actions → "Edit pay rate" opens the dialog',
          'Choose a pay type, currency, rate and effective date — applied to all selected members',
          'Changing the currency warns when selected members are currently paid in a different currency',
        ]},
      ]
    },
    {
      id: 'member-detail',
      label: 'Member Detail',
      href: 'member-detail.html',
      tasks: [
        { text: 'Country field — Info tab → Contact section', target: '.md-tab[data-tab="info"]', sub: [
          'Lives on the Info tab → Contact section, after Home address — hover highlights the Info tab to open',
          'Uses the same md-select styling as the Birthday dropdowns on the same tab',
          'Selecting a country auto-surfaces that country\'s currency at the top of the Pay / Bill currency dropdown, and reorders the list (the currency itself does not change automatically)',
          '~48 countries supported; list is alphabetically sorted',
        ]},
        { text: 'Searchable currency dropdown — Pay / Bill tab → Pay rate', target: '#pb-currency-pay', sub: [
          'Custom dropdown with live search — native <select> replaced to support inline filtering',
          'When a country is selected on Info tab, the matching currency floats to the top above a divider',
          'All remaining currencies follow alphabetically below the divider',
          'The amount field suffix shows the pay period only (e.g. "monthly") — the selected currency lives in this dropdown, not repeated in the suffix',
        ]},
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll',
      href: 'payroll.html',
      tasks: [
        { text: 'Edit pay rate (batch) — select members, then "Edit pay rate"', target: '.col-check, #epr-batch-btn', sub: [
          'Tick the checkbox on one or more members (or the header checkbox to select all) — the blue batch bar appears above the table',
          'Then click "Edit pay rate" in that bar (highlighted) to open the modal',
          'The modal shows an avatar stack + selected count, members grouped by pay type (Fixed / Hourly), and empty fields — members may have different values',
        ]},
        { text: 'Skipped members alert — inside the Edit pay rate modal', target: '#epr-skipped-alert', sub: [
          'Open the Edit pay rate modal, then pick a pay type AND enter a rate — the alert appears only once both are set',
          'It flags members already at that rate: they are skipped, and the new rate applies to the rest',
          'Dismissable via the × button',
        ]},
        { text: 'Currency filter — open the Filters drawer', target: '.btn-filter', sub: [
          'Click "Filters" (highlighted) to open the drawer — the Currency filter is a section inside it',
          'Lists every currency present in the table: USD, EUR, GBP, AUD, CAD, BRL; apply via "Apply filters"',
          'Currency codes are stored as a data-currency attribute on each table row',
        ]},
      ]
    },
    {
      id: 'team-payment',
      label: 'Team Payment',
      href: 'team-payment.html',
      tasks: [
        { text: 'Show the currency code instead of the symbol', target: '.tp-total', sub: [
          'Every monetary value uses the ISO currency code (e.g. "USD 20.00"), never the "$" symbol',
          'Applies to the Total, all breakdown figures, and every amount in the members table including expanded sub-rows',
          'Consistent with the member pay-rate and payroll screens',
        ]},
        { text: 'Pay rate — member\'s own currency only', target: '.tp-td--rate', sub: [
          'Shows the rate the member is actually paid — e.g. "EUR 18.00/hr", "BRL 40.00/hr", "USD 2,000.00/fixed"',
          'No USD conversion: the rate is fixed in the member\'s currency; the USD equivalent fluctuates daily, so showing it would mislead',
          'The USD equivalent belongs on the Total amount (what you pay out), not the rate',
        ]},
        { text: 'Total amount — organization currency, then member currency', target: '.tp-td--total', sub: [
          'Large line: total in the organization currency (USD) — e.g. "USD 680.40" — what you actually pay out',
          'Small line: total in the member\'s own currency — e.g. "EUR 630.00"',
          'Members already paid in USD show a single line',
        ]},
      ]
    },
    {
      id: 'payment-records',
      label: 'Payment records',
      href: 'payment-records.html',
      tasks: [
        { text: 'Show the currency code instead of the symbol', target: '.prl-td--amount', sub: [
          'Amounts in the list use the ISO currency code (e.g. "USD 127.00"), never the "$" symbol',
          'Applies to every value in the Amount column',
          'Consistent with the team payment detail and member pay-rate screens',
        ]},
        { text: 'View breakdown — per-currency popover for multi-currency records', target: '.prl-bd-trigger', sub: [
          'A record can span several member currencies — the cell shows the USD total plus a "View breakdown" link',
          'The popover lists each currency: native amount, exchange rate, and converted USD value',
          'Footer shows the org-currency total and the exchange-rate source and date',
          'Single-currency records show only the USD amount, with no link',
        ]},
      ]
    },
    {
      id: 'payroll-adjustments',
      label: 'Payroll adjustments',
      href: 'payroll-adjustments.html',
      tasks: [
        { text: 'Show the currency code instead of the symbol', target: '.pa-amount', sub: [
          'Amount pills use the ISO currency code (e.g. "USD 442.00" / "+USD 346.00"), never the "$" symbol',
          'Applies to every deduction and addition in the Amount column',
          'Consistent with the team payment, payment records, and member pay-rate screens',
        ]},
        { text: 'Edit dialog — add a currency note + "USD" suffix to Amount per member', target: '.pa-actions-btn', sub: [
          'Actions → Edit opens the "Edit payroll adjustment" dialog',
          'Amount per member shows a "USD" (organization currency) suffix on the right of the field',
          'A helper note reads: "Payroll adjustments are always set in organization currency, (USD — US Dollar)."',
          'Clarifies the amount is in the org currency, not the member\'s local currency',
        ]},
      ]
    },
    {
      id: 'amounts-owed',
      label: 'Amounts owed',
      href: 'amounts-owed.html',
      tasks: [
        { text: 'Currency filter — filter the whole report to one currency', target: '.ao-filters-btn', sub: [
          'Filters → Currency: pick a single currency (BRL, CAD, EUR, GBP, PHP, USD) or "All currencies"',
          'Narrows the table to that currency\'s members and retotals the Hours and Amount cards',
          'The Amount then shows that currency\'s total in USD, with the original-currency total beneath',
        ]},
        { text: 'Hours — Regular vs Overtime split', target: '#ao-hours-sub', sub: [
          'Below the total Hours, a secondary line splits it — e.g. "Regular 466:00:00 · Overtime 31:00:00"',
          'Surfaces overtime exposure and balances the Amount card\'s "View breakdown" line',
          'Always visible; re-totals when filtered by currency, and the Overtime term is dropped when there is none',
        ]},
        { text: 'View breakdown — per-currency popover below the Amount', target: '#ao-bd-open', sub: [
          'The Amount (USD) carries a "View breakdown" link opening a per-currency popover',
          'Lists each currency: native amount, exchange rate, converted USD, plus the org-currency total',
          'Shown in the "All currencies" view; replaced by the native total when filtered to one currency',
        ]},
        { text: 'Current rate — organization currency, then regional currency', target: '.ao-rate', sub: [
          'Large line: rate in the organization currency (USD) with the period — e.g. "USD 25.40/hr"',
          'Small line: rate in the member\'s own (regional) currency — e.g. "GBP 20.00/hr"',
          'Same dual treatment as the Amount column; USD-paid members show one line; no rate shows "No rate set"',
        ]},
        { text: 'Amount — organization currency, then original currency', target: '.ao-amount', sub: [
          'Large line: the amount owed in the organization currency (USD) — what you pay out',
          'Small line beneath: the same amount in the member\'s own (original) currency',
          'Members already paid in USD show a single line',
        ]},
      ]
    },
    {
      id: 'payments',
      label: 'Payments report',
      href: 'payments.html',
      tasks: [
        { text: 'Currency filter — filter the report to one currency', target: '.pmt-filters-btn', sub: [
          'Filters → Currency: pick a single currency (BRL, CAD, EUR, GBP, PHP, USD) or "All currencies"',
          'Narrows the report to that currency\'s payments and re-totals the Payments and Amount cards',
          'The Amount then shows that currency\'s total in USD, with the original-currency total beneath',
        ]},
        { text: 'Payments count — automatic vs one-time split', target: '#pmt-count-note', sub: [
          'A secondary line splits the count — e.g. "19 automatic · 2 one-time"',
          'Separates recurring (automatic) payroll from manual one-off payments at a glance',
          'Re-counts when the report is filtered by currency or date range',
        ]},
        { text: 'View breakdown — per-currency popover below the Amount', target: '#pmt-bd-open', sub: [
          'The Amount (USD) carries a "View breakdown" link opening a per-currency popover',
          'Lists each currency: the original amount and the converted USD value, plus the org-currency total',
          'Same anchored popover used on Amounts owed; links out to Team Payments for per-payment rates',
        ]},
        { text: 'Amount — member\'s original currency, then organization currency', target: '.pmt-member-total', sub: [
          'Each pay component (fixed pay, hourly, PTO & holiday, additions, deductions, bonus) is set in the member\'s currency',
          'The Total Amount shows the organization currency (USD) on top, original-currency total beneath',
          'Members already paid in USD show a single line',
        ]},
        { text: 'Member grouping — more space between members', target: '.pmt-member', sub: [
          'Each member\'s payments are grouped under their name with a running total on the right',
          'Extra spacing above each member separates the groups so each block reads as one unit',
          'The first member sits tight to the header; the gap only appears between groups',
        ]},
      ]
    },
  ];

  var totalTasks = REGISTRY.reduce(function (sum, p) { return sum + p.tasks.length; }, 0);
  var currentFilter = 'all';
  var modalOpen = false;
  var backdrop = null;
  var modal    = null;
  var currentSearch = '';

  /* ── CSS ─────────────────────────────────────────────────── */
  var CSS = [
    /* topbar button */
    '.dt-btn {',
    '  display: inline-flex; align-items: center; gap: 5px;',
    '  padding: 5px 10px 5px 8px; border: none; cursor: pointer;',
    '  background: #f3f4f6; border-radius: 6px; margin-left: 10px;',
    '  font-family: Roboto, sans-serif; font-size: 12px; font-weight: 500;',
    '  color: #6b7280; transition: background 120ms, color 120ms;',
    '  white-space: nowrap; vertical-align: middle; line-height: 1;',
    '}',
    '.dt-btn:hover { background: #e5e7eb; color: #374151; }',
    '.dt-btn .material-symbols-rounded { font-size: 15px !important; }',
    '.dt-btn-badge {',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  min-width: 18px; height: 18px; padding: 0 4px; border-radius: 99px;',
    '  background: #f59e0b; color: #fff; font-size: 10px; font-weight: 700;',
    '}',

    /* backdrop */
    '.dt-backdrop {',
    '  position: fixed; inset: 0; background: rgba(17,24,39,.45);',
    '  z-index: 1200; opacity: 0; transition: opacity 200ms ease; pointer-events: none;',
    '}',
    '.dt-backdrop.is-open { opacity: 1; pointer-events: auto; }',

    /* modal */
    '.dt-modal {',
    '  position: fixed; top: 50%; left: 50%;',
    '  transform: translate(-50%,-52%) scale(0.97);',
    '  width: 760px; max-width: calc(100vw - 48px); max-height: 82vh;',
    '  background: #fff; border-radius: 12px;',
    '  box-shadow: 0 20px 60px rgba(0,0,0,.18);',
    '  z-index: 1201; display: flex; flex-direction: column;',
    '  opacity: 0; transition: opacity 200ms ease, transform 200ms ease;',
    '  pointer-events: none; font-family: Roboto, sans-serif; overflow: hidden;',
    '}',
    '.dt-modal.is-open {',
    '  opacity: 1; transform: translate(-50%,-50%) scale(1); pointer-events: auto;',
    '}',

    /* modal header */
    '.dt-modal-hd {',
    '  display: flex; align-items: center; gap: 10px;',
    '  padding: 16px 20px 14px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;',
    '}',
    '.dt-modal-hd-icon {',
    '  width: 32px; height: 32px; background: #fffbeb; border-radius: 8px;',
    '  display: flex; align-items: center; justify-content: center; flex-shrink: 0;',
    '}',
    '.dt-modal-hd-icon .material-symbols-rounded { font-size: 18px !important; color: #d97706; }',
    '.dt-modal-title { font-size: 15px; font-weight: 600; color: #111827; }',
    '.dt-modal-count {',
    '  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px;',
    '  background: #fef3c7; color: #92400e; margin-left: 4px;',
    '}',
    '.dt-modal-close {',
    '  margin-left: auto; border: none; background: transparent; cursor: pointer;',
    '  color: #9ca3af; padding: 4px; border-radius: 5px;',
    '  display: flex; align-items: center; transition: background 100ms, color 100ms;',
    '}',
    '.dt-modal-close:hover { background: #f3f4f6; color: #374151; }',
    '.dt-modal-close .material-symbols-rounded { font-size: 18px !important; }',

    /* filter pills */
    '.dt-pills {',
    '  display: flex; gap: 6px; padding: 12px 20px;',
    '  border-bottom: 1px solid #f3f4f6; flex-wrap: wrap; flex-shrink: 0;',
    '}',
    '.dt-pill {',
    '  display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px;',
    '  border: 1px solid #e5e7eb; border-radius: 99px;',
    '  font-size: 12px; font-weight: 500; color: #6b7280; background: #fff;',
    '  cursor: pointer; transition: all 120ms ease; white-space: nowrap; user-select: none;',
    '}',
    '.dt-pill:hover { border-color: #d1d5db; color: #374151; background: #f9fafb; }',
    '.dt-pill.is-active { background: #111827; color: #fff; border-color: #111827; }',
    '.dt-pill-count { font-size: 10px; font-weight: 700; opacity: .6; }',
    '.dt-pill.is-active .dt-pill-count { opacity: .75; }',

    /* scrollable content */
    '.dt-content { flex: 1; overflow-y: auto; padding: 16px 20px 20px; }',

    /* accordion page section */
    '.dt-page-section {',
    '  border: 1px solid #f0f0f0; border-radius: 8px; margin-bottom: 8px;',
    '  overflow: hidden;',
    '}',
    '.dt-page-hd {',
    '  display: flex; align-items: center; gap: 8px; padding: 10px 14px;',
    '  background: #f9fafb; cursor: pointer; user-select: none;',
    '  transition: background 120ms;',
    '}',
    '.dt-page-hd:hover { background: #f3f4f6; }',
    '.dt-page-chevron {',
    '  font-size: 17px !important; color: #9ca3af; flex-shrink: 0;',
    '  transition: transform 220ms ease;',
    '}',
    '.dt-page-section.is-collapsed .dt-page-chevron { transform: rotate(-90deg); }',
    '.dt-page-label { font-size: 12px; font-weight: 600; color: #374151; flex: 1; }',
    '.dt-page-badge {',
    '  font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 99px;',
    '  background: #fef3c7; color: #92400e;',
    '}',
    '.dt-page-go {',
    '  font-size: 11px; color: #9ca3af; background: transparent; border: none;',
    '  padding: 2px 7px; border-radius: 4px; cursor: pointer; font-family: Roboto, sans-serif;',
    '  transition: color 100ms, background 100ms;',
    '}',
    '.dt-page-go:hover { color: #0168dd; background: #eff6ff; }',
    '.dt-page-body {',
    '  max-height: 600px; overflow: hidden;',
    '  transition: max-height 220ms ease;',
    '}',
    '.dt-page-section.is-collapsed .dt-page-body { max-height: 0 !important; }',

    /* task items */
    '.dt-tasks { padding: 8px 14px 10px; display: flex; flex-direction: column; gap: 1px; }',
    '.dt-task {',
    '  display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px;',
    '  border-radius: 6px; cursor: pointer; transition: background 100ms; margin: 0 -10px;',
    '}',
    '.dt-task:hover { background: #fffbeb; }',
    '.dt-task:hover .dt-task-dot { transform: scale(1.35); }',
    '.dt-task-dot {',
    '  width: 5px; height: 5px; border-radius: 50%; background: #f59e0b;',
    '  flex-shrink: 0; margin-top: 7px; transition: transform 100ms;',
    '}',
    '.dt-task-body { flex: 1; min-width: 0; }',
    '.dt-task-text { font-size: 13px; color: #374151; line-height: 1.5; }',
    '.dt-task-page-tag {',
    '  display: inline-block; font-size: 10px; font-weight: 500; color: #9ca3af;',
    '  background: #f3f4f6; border-radius: 4px; padding: 1px 5px;',
    '  margin-left: 6px; vertical-align: middle;',
    '}',
    '.dt-task-arrow {',
    '  font-size: 14px !important; color: #d1d5db; flex-shrink: 0;',
    '  margin-top: 4px; transition: color 100ms, transform 100ms;',
    '}',
    '.dt-task:hover .dt-task-arrow { color: #f59e0b; transform: translateX(2px); }',

    /* flat single-page view label */
    '.dt-flat-label {',
    '  font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;',
    '  color: #92400e; margin-bottom: 10px;',
    '}',

    /* highlight applied on target elements */
    '.dt-highlight {',
    '  background-color: rgba(254,243,199,.85) !important;',
    '  box-shadow: 0 0 0 2px #f59e0b, 0 0 14px rgba(245,158,11,.28) !important;',
    '  border-radius: 4px; position: relative; z-index: 5;',
    '}',

    /* search bar */
    '.dt-search-wrap {',
    '  display: flex; align-items: center; gap: 8px;',
    '  padding: 8px 20px 7px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;',
    '}',
    '.dt-search-icon { font-size: 16px !important; color: #9ca3af; flex-shrink: 0; }',
    '.dt-search-input {',
    '  flex: 1; border: none; outline: none; background: transparent;',
    '  font-family: Roboto, sans-serif; font-size: 13px; color: #374151; padding: 0;',
    '}',
    '.dt-search-input::placeholder { color: #d1d5db; }',
    '.dt-search-clear {',
    '  border: none; background: transparent; cursor: pointer; padding: 2px;',
    '  color: #9ca3af; display: flex; align-items: center; border-radius: 4px;',
    '  transition: color 100ms, background 100ms;',
    '}',
    '.dt-search-clear:hover { color: #374151; background: #f3f4f6; }',
    '.dt-search-clear .material-symbols-rounded { font-size: 15px !important; }',
    '.dt-search-empty {',
    '  padding: 36px 20px; text-align: center;',
    '  font-size: 13px; color: #9ca3af; font-family: Roboto, sans-serif;',
    '}',

    /* task detail expansion */
    '.dt-task-details {',
    '  max-height: 0; overflow: hidden;',
    '  transition: max-height 200ms ease;',
    '}',
    '.dt-task.is-expanded .dt-task-details { max-height: 500px; }',
    '.dt-task-detail-item {',
    '  display: flex; gap: 6px; font-size: 12px; color: #6b7280;',
    '  line-height: 1.5; padding: 1px 0 0 2px;',
    '}',
    '.dt-task-detail-dash { color: #d1d5db; flex-shrink: 0; }',

    /* expand toggle button */
    '.dt-task-expand {',
    '  border: none; background: transparent; cursor: pointer; padding: 3px;',
    '  color: #d1d5db; border-radius: 4px; flex-shrink: 0; margin-top: 2px;',
    '  display: flex; align-items: center; transition: color 100ms, background 100ms;',
    '}',
    '.dt-task:hover .dt-task-expand { color: #bbb; }',
    '.dt-task-expand:hover { color: #6b7280 !important; background: #f3f4f6; }',
    '.dt-task-expand .material-symbols-rounded { font-size: 16px !important; transition: transform 200ms ease; }',
    '.dt-task.is-expanded .dt-task-expand .material-symbols-rounded { transform: rotate(180deg); }',

  ].join('\n');

  /* ── helpers ─────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('dt-css')) return;
    var s = document.createElement('style');
    s.id = 'dt-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function currentPageHref() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function highlightElement(selector) {
    document.querySelectorAll('.dt-highlight, .da-highlight').forEach(function (el) {
      el.classList.remove('dt-highlight', 'da-highlight');
    });
    if (!selector) return;
    var targets = document.querySelectorAll(selector);
    if (!targets.length) return;
    targets.forEach(function (t) { t.classList.add('dt-highlight'); });
    targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      document.querySelectorAll('.dt-highlight').forEach(function (el) {
        el.classList.remove('dt-highlight');
      });
    }, 3500);
  }

  /* ── Modal openers — keyed by modal element ID ──────────────
     Each function opens the relevant modal on the target page so
     the subsequent highlight lands inside the open dialog.
  ─────────────────────────────────────────────────────────── */
  var MODAL_OPENERS = {
    'pd-rate-modal': function () {
      var cell = document.querySelector('.js-rate-cell');
      if (cell) cell.click();
    }
  };

  function navigateToTask(pageHref, selector, openModal, extraPanel) {
    var curr = currentPageHref();
    closeModal();
    if (curr === pageHref) {
      // Same page — open modal first (if needed), then highlight
      if (openModal && MODAL_OPENERS[openModal]) {
        MODAL_OPENERS[openModal]();
        setTimeout(function () { highlightElement(selector); }, 400);
      } else {
        setTimeout(function () { highlightElement(selector); }, 180);
      }
    } else {
      // Different page — stash pending in sessionStorage and navigate
      var pending = {};
      if (selector)   pending.selector  = selector;
      if (openModal)  pending.openModal  = openModal;
      if (extraPanel) pending.panel      = extraPanel;
      if (selector || openModal) {
        sessionStorage.setItem('dt_pending', JSON.stringify(pending));
      }
      window.location.href = pageHref;
    }
  }

  /* ── HTML builders ───────────────────────────────────────── */
  function taskItemHTML(text, target, pageHref, openModal, panel, sub) {
    var openModalAttr = openModal ? ' data-open-modal="' + openModal + '"' : '';
    var panelAttr     = panel     ? ' data-panel="' + panel + '"' : '';
    var hasSub = sub && sub.length > 0;
    var detailsHtml = hasSub
      ? '<div class="dt-task-details">'
        + sub.map(function (s) {
            return '<div class="dt-task-detail-item"><span class="dt-task-detail-dash">–</span><span>' + s + '</span></div>';
          }).join('')
        + '</div>'
      : '';
    var expandBtn = hasSub
      ? '<button class="dt-task-expand" title="Details" tabindex="-1">'
        + '<span class="material-symbols-rounded">expand_more</span>'
        + '</button>'
      : '';
    return '<div class="dt-task" data-href="' + pageHref + '" data-target="' + (target || '') + '"' + openModalAttr + panelAttr + '>'
      + '<span class="dt-task-dot"></span>'
      + '<span class="dt-task-body"><span class="dt-task-text">' + text + '</span>' + detailsHtml + '</span>'
      + expandBtn
      + '<span class="material-symbols-rounded dt-task-arrow">arrow_forward</span>'
      + '</div>';
  }

  function renderTasks(tasks, pageHref) {
    return tasks.map(function (t) {
      return taskItemHTML(t.text, t.target, pageHref, t.openModal, t.panel, t.sub);
    }).join('');
  }

  function matchTask(t, query) {
    var q = query.toLowerCase();
    if (t.text.toLowerCase().indexOf(q) !== -1) return true;
    if (t.sub) {
      for (var i = 0; i < t.sub.length; i++) {
        if (t.sub[i].toLowerCase().indexOf(q) !== -1) return true;
      }
    }
    return false;
  }

  function pageSectionHTML(page, tasks) {
    var tasksHtml = renderTasks(tasks, page.href);
    return '<div class="dt-page-section" data-page-id="' + page.id + '">'
      + '<div class="dt-page-hd">'
      +   '<span class="material-symbols-rounded dt-page-chevron">expand_more</span>'
      +   '<span class="dt-page-label">' + page.label + '</span>'
      +   '<span class="dt-page-badge">' + tasks.length + '</span>'
      +   '<button class="dt-page-go" data-href="' + page.href + '">Open page ↗</button>'
      + '</div>'
      + '<div class="dt-page-body"><div class="dt-tasks">' + tasksHtml + '</div></div>'
      + '</div>';
  }

  function contentHTML() {
    var isSearching = currentSearch.trim().length > 0;
    if (isSearching) {
      var query = currentSearch.trim();
      var sections = REGISTRY.map(function (page) {
        var matching = page.tasks.filter(function (t) { return matchTask(t, query); });
        if (!matching.length) return '';
        return pageSectionHTML(page, matching);
      }).filter(Boolean).join('');
      return sections || '<div class="dt-search-empty">No tasks match <strong>"' + query + '"</strong></div>';
    }
    if (currentFilter === 'all') {
      return REGISTRY.map(function (page) {
        return pageSectionHTML(page, page.tasks);
      }).join('');
    } else {
      var page = null;
      for (var i = 0; i < REGISTRY.length; i++) {
        if (REGISTRY[i].id === currentFilter) { page = REGISTRY[i]; break; }
      }
      if (!page) return '';
      return '<div class="dt-flat-label">Required changes · ' + page.label + '</div>'
        + '<div class="dt-tasks">'
        + renderTasks(page.tasks, page.href)
        + '</div>';
    }
  }

  /* ── event wiring ────────────────────────────────────────── */
  function wireContent() {
    if (!modal) return;
    var content = modal.querySelector('.dt-content');

    content.querySelectorAll('.dt-page-hd').forEach(function (hd) {
      hd.addEventListener('click', function (e) {
        if (e.target.classList.contains('dt-page-go') || e.target.closest('.dt-page-go')) return;
        this.closest('.dt-page-section').classList.toggle('is-collapsed');
      });
    });

    content.querySelectorAll('.dt-page-go').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.location.href = this.getAttribute('data-href');
      });
    });

    content.querySelectorAll('.dt-task-expand').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        this.closest('.dt-task').classList.toggle('is-expanded');
      });
    });

    content.querySelectorAll('.dt-task').forEach(function (task) {
      task.addEventListener('click', function (e) {
        if (e.target.closest('.dt-task-expand')) return;
        navigateToTask(
          this.getAttribute('data-href'),
          this.getAttribute('data-target'),
          this.getAttribute('data-open-modal') || null,
          this.getAttribute('data-panel') || null
        );
      });
    });
  }

  function wirePills() {
    if (!modal) return;
    modal.querySelectorAll('.dt-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        // Reset search
        currentSearch = '';
        var si = modal.querySelector('.dt-search-input');
        var sc = modal.querySelector('.dt-search-clear');
        if (si) si.value = '';
        if (sc) sc.hidden = true;

        modal.querySelectorAll('.dt-pill').forEach(function (p) { p.classList.remove('is-active'); });
        this.classList.add('is-active');
        currentFilter = this.getAttribute('data-filter');
        modal.querySelector('.dt-content').innerHTML = contentHTML();
        wireContent();
      });
    });
  }

  function wireSearch() {
    if (!modal) return;
    var input = modal.querySelector('.dt-search-input');
    var clear = modal.querySelector('.dt-search-clear');
    if (!input) return;
    input.addEventListener('input', function () {
      currentSearch = this.value;
      if (clear) clear.hidden = !currentSearch;
      modal.querySelector('.dt-content').innerHTML = contentHTML();
      wireContent();
    });
    if (clear) {
      clear.addEventListener('click', function () {
        currentSearch = '';
        input.value = '';
        this.hidden = true;
        input.focus();
        modal.querySelector('.dt-content').innerHTML = contentHTML();
        wireContent();
      });
    }
  }

  /* ── modal build ─────────────────────────────────────────── */
  function buildModal() {
    var pillsHtml =
      '<button class="dt-pill is-active" data-filter="all">'
      + 'All <span class="dt-pill-count">' + totalTasks + '</span>'
      + '</button>';
    REGISTRY.forEach(function (page) {
      pillsHtml += '<button class="dt-pill" data-filter="' + page.id + '">'
        + page.label + ' <span class="dt-pill-count">' + page.tasks.length + '</span>'
        + '</button>';
    });

    backdrop = document.createElement('div');
    backdrop.className = 'dt-backdrop';
    backdrop.addEventListener('click', closeModal);
    document.body.appendChild(backdrop);

    modal = document.createElement('div');
    modal.className = 'dt-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Design Tasks Overview');
    modal.innerHTML =
      '<div class="dt-modal-hd">'
      +   '<div class="dt-modal-hd-icon"><span class="material-symbols-rounded">task_alt</span></div>'
      +   '<span class="dt-modal-title">Design Tasks</span>'
      +   '<span class="dt-modal-count">' + totalTasks + ' pending</span>'
      +   '<button class="dt-modal-close" aria-label="Close"><span class="material-symbols-rounded">close</span></button>'
      + '</div>'
      + '<div class="dt-pills">' + pillsHtml + '</div>'
      + '<div class="dt-search-wrap">'
      +   '<span class="material-symbols-rounded dt-search-icon">search</span>'
      +   '<input type="text" class="dt-search-input" placeholder="Search tasks…" autocomplete="off">'
      +   '<button class="dt-search-clear" hidden><span class="material-symbols-rounded">close</span></button>'
      + '</div>'
      + '<div class="dt-content">' + contentHTML() + '</div>';
    document.body.appendChild(modal);

    modal.querySelector('.dt-modal-close').addEventListener('click', closeModal);
    wirePills();
    wireContent();
    wireSearch();
  }

  /* ── open / close ────────────────────────────────────────── */
  function openModal() {
    if (!modal) buildModal();
    requestAnimationFrame(function () {
      backdrop.classList.add('is-open');
      modal.classList.add('is-open');
      modalOpen = true;
    });
  }

  function closeModal() {
    if (backdrop) backdrop.classList.remove('is-open');
    if (modal)    modal.classList.remove('is-open');
    modalOpen = false;
  }

  /* ── topbar button injection ─────────────────────────────── */
  function injectButton() {
    var timer = document.querySelector('.hs-timer');
    if (!timer) return;

    var btn = document.createElement('button');
    btn.id = 'dt-topbar-btn';
    btn.className = 'dt-btn';
    btn.setAttribute('title', 'Design Tasks Overview');
    btn.innerHTML =
      '<span class="material-symbols-rounded">task_alt</span>'
      + 'Design tasks'
      + '<span class="dt-btn-badge">' + totalTasks + '</span>';
    btn.addEventListener('click', openModal);

    timer.parentElement.insertBefore(btn, timer.nextSibling);
  }

  /* ── keyboard ────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOpen) closeModal();
  });

  /* ── pending highlight (cross-page navigation) ───────────── */
  function checkPendingHighlight() {
    var raw = sessionStorage.getItem('dt_pending');
    if (!raw) return;
    sessionStorage.removeItem('dt_pending');
    try {
      var data = JSON.parse(raw);
      // Activate sub-panel pill if specified (e.g. bill/project on member-detail)
      if (data.panel) {
        var pillBtn = document.querySelector('#pb-type-toggle .pb-pill[data-panel="' + data.panel + '"]');
        if (pillBtn) pillBtn.click();
      }

      if (data.openModal && MODAL_OPENERS[data.openModal]) {
        setTimeout(function () {
          MODAL_OPENERS[data.openModal]();
          if (data.selector) {
            setTimeout(function () { highlightElement(data.selector); }, 500);
          }
        }, 700);
      } else if (data.selector) {
        setTimeout(function () { highlightElement(data.selector); }, 700);
      }
    } catch (e) {}
  }

  /* ── init ────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    injectButton();
    checkPendingHighlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
