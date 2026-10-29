(() => {
  'use strict';
  const query = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const menu = query('.menu-toggle');
  const nav = query('#primary-nav');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  };
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    nav.classList.toggle('open', expanded);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  query('#copyright-year').textContent = new Date().getFullYear();

  let view = 'selected';
  const search = query('#paper-search');
  const year = query('#paper-year');
  const tabs = all('[data-view]');
  const selected = query('#selected-papers');
  const archive = query('#all-papers');
  const normalize = (text) => text.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const applyFilters = () => {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    all(`#${view === 'selected' ? 'selected-papers' : 'all-papers'} > article`).forEach((paper) => {
      const visible = (!year.value || paper.dataset.year === year.value) && terms.every((term) => normalize(paper.dataset.search).includes(term));
      paper.hidden = !visible;
      if (visible) count += 1;
    });
    query('#no-papers').hidden = count > 0;
    query('#publication-status').textContent = `${count} ${view === 'selected' ? 'selected papers' : 'publications'} shown${search.value.trim() ? ` for “${search.value.trim()}”` : ''}${year.value ? ` from ${year.value}` : ''}.`;
  };
  const setView = (next) => {
    view = next;
    selected.hidden = next !== 'selected';
    archive.hidden = next !== 'all';
    query('#view-all').hidden = next === 'all';
    tabs.forEach((tab) => {
      const active = tab.dataset.view === next;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  };
  query('.publication-controls').hidden = false;
  tabs.forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
  search.addEventListener('input', applyFilters);
  year.addEventListener('change', applyFilters);
  query('#clear-filters').addEventListener('click', () => {
    search.value = '';
    year.value = '';
    applyFilters();
    search.focus();
  });
  query('#view-all').addEventListener('click', (event) => {
    event.preventDefault();
    search.value = '';
    year.value = '';
    setView('all');
    history.replaceState(null, '', '#publications');
    query('#publications').scrollIntoView({ block: 'start' });
    tabs.find((tab) => tab.dataset.view === 'all').focus({ preventScroll: true });
  });
  all('[data-research-search]').forEach((link) => link.addEventListener('click', () => {
    search.value = link.dataset.researchSearch;
    year.value = '';
    setView('all');
  }));
  applyFilters();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        all('nav a[href^="#"]').forEach((link) => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    all('main > section[id], .research-section[id]').forEach((section) => observer.observe(section));
  }
})();
