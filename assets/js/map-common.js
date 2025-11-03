/* global L */
// Utilidades compartidas para mapas Leaflet y viñetas.
(function () {
  'use strict';

  const { PIN, COLORS, ANIM } = window.SITE_CONFIG;

  const tileLayers = [
    {
      url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      options: {
        opacity: 0.96,
        attribution: '&copy; OpenStreetMap, &copy; CARTO'
      }
    },
    {
      url: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
      options: { opacity: 0.4, interactive: false }
    }
  ];

  const resizeHandlers = new WeakMap();
  const sheetRegistry = new WeakMap();

  function applyBaseLayers(map) {
    tileLayers.forEach((layer) => {
      L.tileLayer(layer.url, layer.options).addTo(map);
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
  }

  function registerResize(map) {
    if (resizeHandlers.has(map)) {
      return;
    }

    const invalidate = () => {
      window.requestAnimationFrame(() => map.invalidateSize());
    };

    const listeners = [
      ['resize', invalidate],
      ['orientationchange', invalidate],
      [
        'visibilitychange',
        () => {
          if (!document.hidden) {
            invalidate();
          }
        }
      ]
    ];

    listeners.forEach(([event, handler]) => {
      window.addEventListener(event, handler, { passive: true });
    });

    resizeHandlers.set(map, { invalidate, listeners });
  }

  function initMap(containerId, { center, zoom, scrollWheelZoom = false, wheelToggleOnHover = false } = {}) {
    const map = L.map(containerId, {
      zoomControl: false,
      scrollWheelZoom,
      preferCanvas: false,
      tap: true,
      maxZoom: 20
    });

    applyBaseLayers(map);

    if (typeof center !== 'undefined' && typeof zoom !== 'undefined') {
      map.setView(center, zoom);
    }

    registerResize(map);

    if (wheelToggleOnHover) {
      const container = map.getContainer();
      map.scrollWheelZoom.disable();
      container.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
      container.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
    }

    sheetRegistry.set(map, new Set());

    return map;
  }

  function createPinIcon(type) {
    const pin = PIN[type];
    if (!pin) {
      throw new Error(`Tipo de pin desconocido: ${type}`);
    }

    return L.divIcon({
      className: `pin pin--${type}`,
      html: '<span class="pin__circle" aria-hidden="true"></span>',
      iconSize: [pin.diameter, pin.diameter],
      iconAnchor: [pin.diameter / 2, pin.diameter / 2]
    });
  }

  function createClusterGroup(options = {}) {
    return L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction(cluster) {
        const count = cluster.getChildCount();
        const { diameter, border, fontSize, fontWeight } = PIN.cluster;
        const div = document.createElement('div');
        div.className = 'cluster';
        div.style.setProperty('--cluster-size', `${diameter}px`);
        div.style.setProperty('--cluster-border', `${border}px`);
        div.style.setProperty('--cluster-font', `${fontSize}px`);
        div.style.fontWeight = fontWeight;
        div.style.color = COLORS.stroke;
        div.innerHTML = `<span>${count}</span>`;

        return L.divIcon({
          html: div.outerHTML,
          className: 'cluster-wrapper',
          iconSize: [diameter, diameter],
          iconAnchor: [diameter / 2, diameter / 2]
        });
      },
      ...options
    });
  }

  function showSheet(map, sheet) {
    if (!sheet) return;
    sheet.hidden = false;
    sheet.classList.add('is-visible');
    window.requestAnimationFrame(() => map.invalidateSize());
  }

  function hideSheet(map, sheet) {
    if (!sheet) return;
    sheet.classList.remove('is-visible');
    const onTransitionEnd = () => {
      sheet.hidden = true;
      sheet.removeEventListener('transitionend', onTransitionEnd);
      map.invalidateSize();
    };
    sheet.addEventListener('transitionend', onTransitionEnd, { once: true });
  }

  function registerSheet(map, sheet) {
    const sheets = sheetRegistry.get(map) || new Set();
    sheets.add(sheet);
    sheetRegistry.set(map, sheets);
  }

  function closeOtherSheets(map, sheetToKeep) {
    const sheets = sheetRegistry.get(map);
    if (!sheets) return;
    sheets.forEach((sheet) => {
      if (sheet !== sheetToKeep) {
        hideSheet(map, sheet);
      }
    });
  }

  function flyToWithSheet(map, latlng, sheet, { zoom, onBefore, onAfter } = {}) {
    closeOtherSheets(map, sheet);
    if (typeof onBefore === 'function') {
      onBefore();
    }

    hideSheet(map, sheet);

    const targetZoom = typeof zoom === 'number' ? zoom : map.getZoom();
    map.flyTo(latlng, targetZoom, { duration: ANIM.flyToDuration });

    let opened = false;

    const reveal = () => {
      if (opened) return;
      opened = true;
      if (typeof onAfter === 'function') {
        onAfter();
      }
      showSheet(map, sheet);
    };

    const timeoutId = window.setTimeout(reveal, ANIM.sheetDelay);

    map.once('moveend', () => {
      window.clearTimeout(timeoutId);
      reveal();
    });
  }

  window.MapCommon = {
    initMap,
    createPinIcon,
    createClusterGroup,
    registerSheet,
    showSheet,
    hideSheet,
    flyToWithSheet
  };
})();
