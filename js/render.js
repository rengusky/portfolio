/**
 * render.js
 * Fetches content from data/projects.json and renders
 * project cards into the work grid.
 *
 * To add/update a project: edit data/projects.json
 */

'use strict';

/* ── Projects ─────────────────────────────────────────────────── */

function renderProjects(projects) {
  const grid = document.querySelector('.work__grid');
  if (!grid) return;

  grid.innerHTML = projects.map(function (p) {
    return `
      <article class="card" aria-label="${p.title} case study">
        <div class="card__image">
          <img
            src="${p.image}"
            alt="${p.alt}"
            loading="lazy"
            width="640"
            height="360"
          />
        </div>
        <div class="card__body">
          <span class="card__tag">${p.tag}</span>
          <h3 class="card__title">${p.title}</h3>
          <p class="card__desc">${p.desc}</p>
          <a href="${p.link}" class="card__link">View case study →</a>
        </div>
      </article>
    `;
  }).join('');
}


/* ── Bootstrap ────────────────────────────────────────────────── */

async function init() {
  try {
    const res      = await fetch('data/projects.json');
    const projects = await res.json();
    renderProjects(projects);
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
