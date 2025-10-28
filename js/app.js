/* global L */
(function () {
  'use strict';

  const HAND_FALLBACK = `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128' shape-rendering='crispEdges'><path fill='%23111' d='M44 12h16v44H44zM60 24h16v48H60zM76 36h16v52H76zM28 40h16v76H28zM12 60h16v56H12z'/></svg>")}")`;
  const PIN_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 44'><path d='M17 1c-7 0-13 6-13 13 0 10 13 29 13 29s13-19 13-29C30 7 24 1 17 1Z' fill='%23fff' stroke='%23111' stroke-width='2'/><circle cx='17' cy='14' r='6.5' fill='%23fff' stroke='%23111' stroke-width='2'/><circle cx='15' cy='13' r='1.5'/><circle cx='19' cy='13' r='1.5'/><path d='M13 18c2.5 2.5 5.5 2.5 8 0' fill='none' stroke='%23111' stroke-width='2' stroke-linecap='round'/></svg>")}`;
  const PORTRAIT_FALLBACK = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAYAAAAp8mGQAAAACXBIWXMAAAsSAAALEgHS3X78AAABa0lEQVR4nO2Ty0scURTHf4l8m1x3R4ZpZpJm0hYVQkqC7E7g6cG8i4bW0QW4H9bTWeWlS6m1W3qQm2pQGgE0iOtiB6Q6FQmFxG3P3j7c8c8gZb9l6H1zv1z9v+8c9wqk2m1q1r8d4s2k7eS6Wn8Qwz7M2VgU8bYy8n9lC1P5B0KpYx/7y8m3p1O3YqZ1H1o1Y3b3s8rXwq4Qk5P9+dnI9b7cO3zQkQXq9YkF8M0vG3Fovh3vQpG8Xx9yH0lAr+oQ4YbV8cL3ZrR4Vf1o9j9z1bX3G9pQ6J4ZpB1W4vG1Qij0Uo0dM7Q6Wj2X7oJp0mCw2oJr0kIhTUZ0wE0lCwU0yWJ6YlQn8W9wq0W6u2G6m3U4g4d8J2C+5x1YxV8eR3r1hH2p6b0aJd0nOe9w1sQYl5x9m8v3p5pB6c8S9mQJ+7K1qkF5i8S1w5pX4r8q+6D3/9k9u3w8P6j6v+zV3YtHjP5jY5vYF0iG6iH3s5H1k0iGx9Y8dA0uVyc1J5pQAAAABJRU5ErkJggg==")`;

  const HAND_ICON_URL = 'assets/images/hand-pointer.svg';
  const PIN_ICON_URL = 'assets/images/pin-face.svg';
  const PORTRAIT_URL = 'assets/images/imagen.svg';

  function ensureAsset(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function hydrateThemeAssets() {
    const docStyle = document.documentElement.style;
    const [handOk, portraitOk] = await Promise.all([
      ensureAsset(HAND_ICON_URL),
      ensureAsset(PORTRAIT_URL)
    ]);

    if (!handOk) {
      docStyle.setProperty('--hand-uri', HAND_FALLBACK);
    }
    if (!portraitOk) {
      docStyle.setProperty('--portrait-uri', PORTRAIT_FALLBACK);
    }
  }

  const map = L.map('map', { zoomControl: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    opacity: 0.96,
    attribution: '&copy; OpenStreetMap, &copy; CARTO'
  }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    opacity: 0.4
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const HOME_CENTER = [47.1, 2.6];
  const HOME_ZOOM = 5.4;
  const PROJECT_CENTER = [46.6, 2.6];
  const PROJECT_ZOOM = 6;

  const projects = [
    { id: 'rouen', title: 'Etude de rabattement périurbain a la Métropole de Rouen', client: 'Métropole de Rouen', partner: { name: 'Ecov', url: '#' }, date: '2023–2024', description: 'Proposition de solutions multimodales pour favoriser les déplacements périurbains et améliorer les rabattements vers la métropole.', coords: [49.443, 1.099] },
    { id: 'paris', title: 'Projet – Paris', client: 'Client X', partner: { name: 'Partenaire Y', url: '#' }, date: '2024', description: 'Description courte du projet à Paris.', coords: [48.8566, 2.3522] },
    { id: 'reims', title: 'Projet – Reims', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2023', description: 'Brève description à Reims.', coords: [49.258, 4.031] },
    { id: 'lille', title: 'Projet – Lille', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2023', description: 'Brève description à Lille.', coords: [50.629, 3.057] },
    { id: 'rennes', title: 'Projet – Rennes', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2022', description: 'Brève description à Rennes.', coords: [48.117, -1.677] },
    { id: 'nantes', title: 'Projet – Nantes', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2022', description: 'Brève description à Nantes.', coords: [47.218, -1.553] },
    { id: 'clermont', title: 'Projet – Clermont-Ferrand', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2022', description: 'Brève description à Clermont-Ferrand.', coords: [45.777, 3.087] },
    { id: 'lyon', title: 'Projet – Lyon', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2022', description: 'Brève description à Lyon.', coords: [45.764, 4.835] },
    { id: 'toulouse', title: 'Projet – Toulouse', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2021', description: 'Brève description à Toulouse.', coords: [43.604, 1.443] },
    { id: 'bayonne', title: 'Projet – Bayonne', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2021', description: 'Brève description à Bayonne.', coords: [43.4929, -1.4748] },
    { id: 'montpellier', title: 'Projet – Montpellier', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2021', description: 'Brève description à Montpellier.', coords: [43.611, 3.877] },
    { id: 'marseille', title: 'Projet – Marseille', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2020', description: 'Brève description à Marseille.', coords: [43.296, 5.369] },
    { id: 'nice', title: 'Projet – Nice', client: 'Client', partner: { name: 'Partenaire', url: '#' }, date: '2020', description: 'Brève description à Nice.', coords: [43.71, 7.262] }
  ];

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 40
  });

  let pinIcon = L.icon({
    iconUrl: PIN_FALLBACK,
    iconSize: [42, 54],
    iconAnchor: [21, 50],
    popupAnchor: [0, -40]
  });

  ensureAsset(PIN_ICON_URL).then((ok) => {
    if (ok) {
      pinIcon = L.icon({
        iconUrl: PIN_ICON_URL,
        iconSize: [42, 54],
        iconAnchor: [21, 50],
        popupAnchor: [0, -40]
      });
      if (map.hasLayer(cluster)) {
        refreshProjectMarkers();
      }
    }
  });

  function refreshProjectMarkers() {
    cluster.clearLayers();
    projects.forEach((project) => {
      const marker = L.marker(project.coords, { icon: pinIcon, title: project.title });
      marker.on('click', () => openProjectPanel(project));
      cluster.addLayer(marker);
    });
    if (!map.hasLayer(cluster)) {
      map.addLayer(cluster);
    }
  }

  function removeProjectMarkers() {
    if (map.hasLayer(cluster)) {
      map.removeLayer(cluster);
    }
  }

  const sections = Array.from(document.querySelectorAll('[data-screen]')).reduce((acc, section) => {
    acc[section.dataset.screen] = section;
    return acc;
  }, {});

  const NAV_ITEMS = [
    { id: 'home', label: 'Accueil', screen: 'home', icon: 'home' },
    { id: 'projects', label: 'Études en France', screen: 'projects' },
    { id: 'contact', label: 'Contact', href: 'mailto:gabriel.oyarzun@studio-territoires.fr' }
  ];

  const navContainer = document.querySelector('.nav');
  NAV_ITEMS.forEach((item) => {
    if (item.href) {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      link.rel = 'noopener';
      link.className = 'nav__link';
      navContainer.appendChild(link);
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.screenTarget = item.screen;
    button.textContent = item.label;

    if (item.icon === 'home') {
      const img = document.createElement('img');
      img.src = 'assets/images/icon-home.svg';
      img.alt = '';
      img.width = 18;
      img.height = 18;
      const label = document.createElement('span');
      label.textContent = item.label;
      button.textContent = '';
      button.append(img, label);
    }

    button.addEventListener('click', () => activateScreen(item.screen));
    navContainer.appendChild(button);
  });

  function activateScreen(id) {
    Object.entries(sections).forEach(([key, section]) => {
      if (!section) return;
      section.hidden = key !== id;
    });

    Array.from(navContainer.querySelectorAll('button')).forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.screenTarget === id);
    });

    if (id === 'projects') {
      toProjects();
    } else if (id === 'home') {
      toHome();
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      activateScreen('home');
    }
  });

  const bulletItems = document.querySelectorAll('.bullets li[data-target]');
  bulletItems.forEach((item) => {
    item.addEventListener('click', () => activateScreen(item.dataset.target));
    item.addEventListener('pointerdown', () => {
      item.style.transform = 'scale(0.96)';
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
      item.addEventListener(evt, () => {
        item.style.transform = '';
      });
    });
  });

  const panelElement = document.getElementById('projectPanel');
  const panelTitle = document.getElementById('ppTitle');
  const panelClient = document.getElementById('ppClient');
  const panelPartner = document.getElementById('ppPartner');
  const panelDate = document.getElementById('ppDate');
  const panelDescription = document.getElementById('ppDesc');

  function openProjectPanel(project) {
    panelTitle.textContent = project.title;
    panelClient.textContent = project.client || '';
    panelPartner.textContent = (project.partner && project.partner.name) || '';
    panelPartner.href = (project.partner && project.partner.url) || '#';
    panelDate.textContent = project.date || '';
    panelDescription.textContent = project.description || '';
    panelElement.hidden = false;
  }

  const photoCard = document.getElementById('stamp');
  const heroBox = document.getElementById('heroBox');
  const motion = { speed: 6, jitter: 0.08, bounce: 0.95, margin: 12 };
  let sx = 0;
  let sy = 0;
  let svx = 0;
  let svy = 0;
  let playfield = { left: 0, top: 0, right: 0, bottom: 0 };
  let animationId;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function computePlayfield() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = motion.margin;
    const rect = photoCard.getBoundingClientRect();
    const isMobile = window.matchMedia('(max-width: 760px)').matches;

    if (isMobile) {
      playfield = {
        left: margin,
        top: margin,
        right: vw - rect.width - margin,
        bottom: vh * 0.5 - rect.height - margin
      };
    } else {
      const heroRect = heroBox.getBoundingClientRect();
      const left = Math.min(vw - rect.width - margin, heroRect.right + margin);
      const top = Math.min(vh - rect.height - margin, Math.max(margin, heroRect.top));
      playfield = {
        left,
        top,
        right: vw - rect.width - margin,
        bottom: vh - rect.height - margin
      };
    }

    sx = clamp(sx, playfield.left, playfield.right);
    sy = clamp(sy, playfield.top, playfield.bottom);
    placePhotoCard();
  }

  function placePhotoCard() {
    photoCard.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
  }

  function initPhotoCard() {
    computePlayfield();
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    const rect = photoCard.getBoundingClientRect();
    const angle = Math.random() * Math.PI * 2;
    svx = Math.cos(angle) * motion.speed;
    svy = Math.sin(angle) * motion.speed;

    if (isMobile) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      sx = clamp((vw - rect.width) / 2, playfield.left, playfield.right);
      sy = clamp(vh * 0.25 - rect.height / 2, playfield.top, playfield.bottom);
    } else {
      sx = playfield.left + 4;
      sy = playfield.top + 4;
    }

    placePhotoCard();
  }

  function stepPhotoCard() {
    const dt = 1 / 60;
    svx += (Math.random() - 0.5) * motion.jitter * dt;
    svy += (Math.random() - 0.5) * motion.jitter * dt;
    sx += svx * dt;
    sy += svy * dt;

    if (sx < playfield.left) {
      sx = playfield.left;
      svx = Math.abs(svx) * motion.bounce;
    }
    if (sx > playfield.right) {
      sx = playfield.right;
      svx = -Math.abs(svx) * motion.bounce;
    }
    if (sy < playfield.top) {
      sy = playfield.top;
      svy = Math.abs(svy) * motion.bounce;
    }
    if (sy > playfield.bottom) {
      sy = playfield.bottom;
      svy = -Math.abs(svy) * motion.bounce;
    }

    placePhotoCard();
    animationId = requestAnimationFrame(stepPhotoCard);
  }

  function startPhotoCard() {
    photoCard.hidden = false;
    cancelAnimationFrame(animationId);
    initPhotoCard();
    animationId = requestAnimationFrame(stepPhotoCard);
  }

  function stopPhotoCard() {
    cancelAnimationFrame(animationId);
    photoCard.hidden = true;
  }

  window.addEventListener('resize', computePlayfield);

  function toHome() {
    map.setView(HOME_CENTER, HOME_ZOOM);
    removeProjectMarkers();
    panelElement.hidden = true;
    startPhotoCard();
  }

  function toProjects() {
    map.flyTo(PROJECT_CENTER, PROJECT_ZOOM, { duration: 2, easeLinearity: 0.2 });
    refreshProjectMarkers();
    panelElement.hidden = true;
    stopPhotoCard();
  }

  function init() {
    hydrateThemeAssets();
    map.setView(HOME_CENTER, HOME_ZOOM);
    activateScreen('home');
  }

  init();

  console.assert(typeof L !== 'undefined', 'Leaflet should be available');
  console.assert(Array.isArray(projects) && projects.length > 0, 'Project list should not be empty');
})();
