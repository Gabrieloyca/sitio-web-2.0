// Configuración del mapa de contacto y acciones rápidas.
(function () {
  'use strict';

  const { CENTER, ZOOMS, ANIM } = window.SITE_CONFIG;
  const map = MapCommon.initMap('map', {
    center: CENTER.contact,
    zoom: ZOOMS.contacto,
    scrollWheelZoom: false,
    wheelToggleOnHover: true
  });

  const joinvilleMarker = L.marker(CENTER.contact, { icon: MapCommon.createPinIcon('chef') }).addTo(map);
  joinvilleMarker.bindTooltip('Joinville-le-Pont', { direction: 'top' });

  const zoomButton = document.querySelector('[data-contact-zoom]');
  if (zoomButton) {
    zoomButton.addEventListener('click', () => {
      map.flyTo(CENTER.contact, ZOOMS.contacto, { duration: ANIM.flyToDuration });
    });
  }
})();
