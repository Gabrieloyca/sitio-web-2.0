// Interacciones específicas de la portada.
(function () {
  'use strict';

  const map = MapCommon.initMap('map', {
    center: [46.6, 2.6],
    zoom: 6,
    scrollWheelZoom: true,
    wheelToggleOnHover: false
  });

  const featuredProjects = [
    {
      title: 'Plan de circulation – Penvénan',
      role: 'chef',
      coords: [48.8, -3.3]
    },
    {
      title: 'Flux & stationnement – Provins',
      role: 'charge',
      coords: [48.55, 3.3]
    },
    {
      title: 'Mobilité périurbaine – Rouen',
      role: 'chef',
      coords: [49.44, 1.1]
    },
    {
      title: 'Schéma directeur cyclable – Amiens',
      role: 'chef',
      coords: [49.9, 2.3]
    },
    {
      title: 'Sécurisation modes actifs – Nantes',
      role: 'chef',
      coords: [47.22, -1.65]
    }
  ];

  const clusterGroup = MapCommon.createClusterGroup();

  featuredProjects.forEach((project) => {
    const marker = L.marker(project.coords, { icon: MapCommon.createPinIcon(project.role) });
    marker.bindPopup(`<strong>${project.title}</strong>`);
    clusterGroup.addLayer(marker);
  });

  clusterGroup.on('clusterclick', (event) => {
    const currentZoom = map.getZoom();
    map.flyTo(event.latlng, currentZoom + 2, { duration: window.SITE_CONFIG.ANIM.flyToDuration });
  });

  map.addLayer(clusterGroup);
})();
