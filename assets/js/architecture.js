// Interacción del mapa de proyectos de arquitectura.
(function () {
  'use strict';

  const { ZOOMS } = window.SITE_CONFIG;

  const projects = [
    {
      id: 'las-condes',
      title: 'Résidence Las Condes',
      team: 'Atelier GO + Studio Andes',
      role: 'chef',
      year: '2022',
      description:
        'Rénovation intérieure complète avec priorisation des matériaux biosourcés et travail sur la lumière naturelle.',
      coords: [-33.4308, -70.6106]
    },
    {
      id: 'providencia',
      title: 'Tiny House Providencia',
      team: 'Atelier GO',
      role: 'charge',
      year: '2021',
      description:
        'Prototype compact pensé pour un montage rapide, modulable et réversible au sein de parcelles urbaines.',
      coords: [-33.4321, -70.609]
    }
  ];

  const sheet = document.getElementById('archSheet');
  const sheetClose = document.querySelector('[data-arch-close]');

  const map = MapCommon.initMap('map', {
    center: [-33.43, -70.62],
    zoom: ZOOMS.arquitectura,
    scrollWheelZoom: true,
    wheelToggleOnHover: false
  });

  MapCommon.registerSheet(map, sheet);

  if (sheetClose) {
    sheetClose.addEventListener('click', () => MapCommon.hideSheet(map, sheet));
  }

  const clusterGroup = MapCommon.createClusterGroup();

  projects.forEach((project) => {
    const marker = L.marker(project.coords, { icon: MapCommon.createPinIcon(project.role) });

    marker.on('click', () => {
      populateSheet(project);
      MapCommon.flyToWithSheet(map, marker.getLatLng(), sheet, {
        zoom: Math.max(ZOOMS.arquitectura + 1, 16)
      });
    });

    clusterGroup.addLayer(marker);
  });

  clusterGroup.on('clusterclick', (event) => {
    map.flyTo(event.latlng, map.getZoom() + 1.5, { duration: window.SITE_CONFIG.ANIM.flyToDuration });
  });

  map.addLayer(clusterGroup);

  function populateSheet(project) {
    document.getElementById('archTitle').textContent = project.title;
    document.getElementById('archTeam').textContent = project.team;
    document.getElementById('archYear').textContent = project.year;
    document.getElementById('archDesc').textContent = project.description;
  }
})();
