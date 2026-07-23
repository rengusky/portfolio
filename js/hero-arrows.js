/**
 * hero-arrows.js
 * Draws curved, hand-drawn style SVG arrows between the
 * annotation labels and the portrait photo in the hero section.
 *
 * - Uses cubic bezier curves for natural arcs
 * - SVG feTurbulence filter gives a slight hand-drawn wobble
 * - Stroke-dashoffset animation draws each arrow in on load
 * - Redraws on window resize
 */

'use strict';

(function () {

  var STROKE_COLOR  = '#bbbbbb';
  var STROKE_WIDTH  = 1.6;
  var ARROW_DELAY   = 0.38; // seconds — start after CSS anno fade-in


  /* ── Helpers ──────────────────────────────────────────────── */

  // Bounding box relative to a container element
  function relRect(el, container) {
    var e = el.getBoundingClientRect();
    var c = container.getBoundingClientRect();
    return {
      left:   e.left   - c.left,
      top:    e.top    - c.top,
      right:  e.right  - c.left,
      bottom: e.bottom - c.top,
      width:  e.width,
      height: e.height,
      midX:   e.left   - c.left + e.width  / 2,
      midY:   e.top    - c.top  + e.height / 2
    };
  }

  // Cubic bezier path string (S-curve between two points)
  function bezierPath(x1, y1, x2, y2) {
    var bend = Math.abs(x2 - x1) * 0.42;
    return (
      'M ' + x1 + ',' + y1 +
      ' C ' + (x1 + bend) + ',' + y1 +
      ' '  + (x2 - bend) + ',' + y2 +
      ' '  + x2 + ',' + y2
    );
  }

  function svgEl(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }


  /* ── Build SVG ────────────────────────────────────────────── */

  function buildSVG(stage) {
    var r = stage.getBoundingClientRect();
    var svg = svgEl('svg');
    svg.classList.add('hero__arrows-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);

    // Defs: sketchy filter + open arrowhead markers
    var defs = svgEl('defs');
    defs.innerHTML =
      '<filter id="sketchy" x="-10%" y="-10%" width="120%" height="120%">' +
        '<feTurbulence type="turbulence" baseFrequency="0.06 0.07" numOctaves="3" seed="8" result="noise"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +

      // Arrowhead pointing right →
      '<marker id="arr-r" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">' +
        '<path d="M1,1 L7,4 L1,7" stroke="' + STROKE_COLOR + '" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</marker>' +

      // Arrowhead pointing left ←
      '<marker id="arr-l" markerWidth="9" markerHeight="9" refX="2" refY="4" orient="auto">' +
        '<path d="M8,1 L2,4 L8,7" stroke="' + STROKE_COLOR + '" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</marker>';

    svg.appendChild(defs);
    return svg;
  }


  /* ── Draw a single animated path ─────────────────────────── */

  function drawPath(svg, d, markerEnd, delay) {
    var path = svgEl('path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', STROKE_COLOR);
    path.setAttribute('stroke-width', STROKE_WIDTH);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('marker-end', 'url(#' + markerEnd + ')');
    path.setAttribute('filter', 'url(#sketchy)');

    svg.appendChild(path); // must be in DOM before getTotalLength()

    var len = path.getTotalLength();
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    path.style.opacity = '0';
    path.style.transition =
      'stroke-dashoffset 0.75s cubic-bezier(0.4,0,0.2,1) ' + delay + 's,' +
      'opacity 0.01s linear ' + delay + 's';

    // Double rAF ensures transition triggers after paint
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        path.style.opacity = '1';
        path.style.strokeDashoffset = '0';
      });
    });
  }


  /* ── Main ─────────────────────────────────────────────────── */

  function draw() {
    if (window.innerWidth < 768) return; // mobile: no arrows

    var stage      = document.querySelector('.hero__stage');
    var photo      = document.querySelector('.hero__photo');
    var leftAnnos  = document.querySelectorAll('.hero__col--left  .anno__content');
    var rightAnnos = document.querySelectorAll('.hero__col--right .anno__content');

    if (!stage || !photo || !leftAnnos.length) return;

    // Remove existing SVG (for resize redraws)
    var old = stage.querySelector('.hero__arrows-svg');
    if (old) old.remove();

    var svg      = buildSVG(stage);
    var photoR   = relRect(photo, stage);

    // Y anchor points distributed along each photo edge
    var yPoints = [0.2, 0.5, 0.8];

    // Left annotations → photo left edge
    leftAnnos.forEach(function (anno, i) {
      var ar   = relRect(anno, stage);
      var endY = photoR.top + photoR.height * yPoints[i];

      var d = bezierPath(
        ar.right,        ar.midY,   // start: right edge of annotation
        photoR.left - 4, endY       // end: just before photo left edge
      );
      drawPath(svg, d, 'arr-r', ARROW_DELAY + i * 0.1);
    });

    // Photo right edge → right annotations
    rightAnnos.forEach(function (anno, i) {
      var ar    = relRect(anno, stage);
      var startY = photoR.top + photoR.height * yPoints[i];

      var d = bezierPath(
        photoR.right + 4, startY,  // start: just after photo right edge
        ar.left,          ar.midY  // end: left edge of annotation
      );
      drawPath(svg, d, 'arr-r', ARROW_DELAY + i * 0.1);
    });

    stage.style.position = 'relative';
    stage.appendChild(svg);
  }


  // Draw after full page load (images/fonts settled)
  window.addEventListener('load', draw);

  // Redraw on resize (debounced)
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 160);
  });

})();
