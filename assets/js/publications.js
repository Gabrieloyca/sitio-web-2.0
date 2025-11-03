// Mapa sticky para la sección de publicaciones.
(function () {
  'use strict';

  const map = MapCommon.initMap('pubMap', {
    center: [46.5, 2.2],
    zoom: 5,
    scrollWheelZoom: false,
    wheelToggleOnHover: true
  });

  const markers = [
    { coords: [48.8566, 2.3522], title: 'Mobilité partagée en Île-de-France' },
    { coords: [45.764, 4.8357], title: 'Repenser le rabattement vers le tram-train lyonnais' },
    { coords: [50.6292, 3.0573], title: 'Études comparées des hubs cyclables européens' }
  ];

  const clusterGroup = MapCommon.createClusterGroup();

  markers.forEach((item) => {
    const marker = L.marker(item.coords, { icon: MapCommon.createPinIcon('charge') });
    marker.bindTooltip(item.title, { direction: 'top' });
    clusterGroup.addLayer(marker);
  });

  clusterGroup.on('clusterclick', (event) => {
    map.flyTo(event.latlng, map.getZoom() + 2, { duration: window.SITE_CONFIG.ANIM.flyToDuration });
  });

  map.addLayer(clusterGroup);
})();
