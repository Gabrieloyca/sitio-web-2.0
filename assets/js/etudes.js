// Configuración del mapa de movilidad y viñeta.
(function () {
  'use strict';

  const { ZOOMS } = window.SITE_CONFIG;

  const projects = [
    {
      id: 'penvenan',
      title: 'Plan de circulation et de stationnement de Penvénan',
      year: '2024',
      client: 'ANCT',
      partner: 'PCAET Bretagne',
      role: 'chef',
      description:
        'Diagnostic multimodal et ateliers de concertation pour hiérarchiser les enjeux locaux avant la mise en œuvre du plan d’actions.',
      coords: [48.8, -3.3]
    },
    {
      id: 'provins',
      title: 'Flux et stationnement – Gare de Provins',
      year: '2023',
      client: 'CDHU',
      partner: 'Ville de Provins',
      role: 'charge',
      description:
        'Analyse des rotations, priorisation des secteurs critiques et recommandations opérationnelles sur le court terme.',
      coords: [48.55, 3.3]
    },
    {
      id: 'rouen',
      title: 'Mobilité périurbaine – Métropole de Rouen',
      year: '2024',
      client: 'Métropole de Rouen',
      partner: 'Setec mobilité',
      role: 'chef',
      description:
        'Construction de scénarios multimodaux hiérarchisés selon leur impact et leur faisabilité sur les quadrants périurbains.',
      coords: [49.44, 1.1]
    }
  ];

  const sheet = document.getElementById('projectSheet');
  const sheetClose = document.querySelector('[data-sheet-close]');

  const map = MapCommon.initMap('map', {
    center: [47.2, 2],
    zoom: ZOOMS.movilidad,
    scrollWheelZoom: false,
    wheelToggleOnHover: true
  });

  MapCommon.registerSheet(map, sheet);

  if (sheetClose) {
    sheetClose.addEventListener('click', () => {
      MapCommon.hideSheet(map, sheet);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      MapCommon.hideSheet(map, sheet);
    }
  });

  const clusterGroup = MapCommon.createClusterGroup();

  projects.forEach((project) => {
    const marker = L.marker(project.coords, { icon: MapCommon.createPinIcon(project.role) });

    marker.on('click', () => {
      populateSheet(project);
      MapCommon.flyToWithSheet(map, marker.getLatLng(), sheet, {
        zoom: Math.max(ZOOMS.movilidad + 2, 14)
      });
    });

    clusterGroup.addLayer(marker);
  });

  clusterGroup.on('clusterclick', (event) => {
    const currentZoom = map.getZoom();
    map.flyTo(event.latlng, currentZoom + 2, { duration: window.SITE_CONFIG.ANIM.flyToDuration });
  });

  map.addLayer(clusterGroup);

  const statChef = document.getElementById('statChef');
  const statCharge = document.getElementById('statCharge');

  if (statChef) {
    statChef.textContent = projects.filter((item) => item.role === 'chef').length;
  }

  if (statCharge) {
    statCharge.textContent = projects.filter((item) => item.role === 'charge').length;
  }

  function populateSheet(project) {
    document.getElementById('ppTitle').textContent = project.title;
    document.getElementById('ppYear').textContent = project.year;
    document.getElementById('ppClient').textContent = project.client;
    document.getElementById('ppPartner').textContent = project.partner || '—';
    document.getElementById('ppRole').textContent = project.role === 'chef' ? 'Chef de projet' : 'Chargé d’études';
    document.getElementById('ppDesc').textContent = project.description;
  }
})();
