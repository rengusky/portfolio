(() => {
  const tablist = document.querySelector('[role="tablist"][aria-label="Feature areas"]');
  if (!tablist) return;

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[data-panel]')];

  const activate = (name, updateHash = true) => {
    const activeTab = tabs.find((tab) => tab.dataset.tab === name);
    const activePanel = panels.find((panel) => panel.dataset.panel === name);
    if (!activeTab || !activePanel) return;

    tabs.forEach((tab) => {
      const selected = tab === activeTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel !== activePanel;
    });

    if (updateHash) history.replaceState(null, '', `#${name}`);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      let targetIndex = index;
      if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') targetIndex = 0;
      else if (event.key === 'End') targetIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      tabs[targetIndex].focus();
      activate(tabs[targetIndex].dataset.tab);
    });
  });

  const initial = location.hash.slice(1);
  if (tabs.some((tab) => tab.dataset.tab === initial)) activate(initial, false);
})();
