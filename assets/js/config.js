// Parámetros globales centralizados
// Se comparten entre todas las páginas para mantener coherencia visual/interactiva.
window.SITE_CONFIG = {
  PIN: {
    chef: { diameter: 28, border: 4 }, // Jefe de proyecto
    charge: { diameter: 22, border: 3 }, // Chargé d’études
    cluster: { diameter: 36, border: 4, fontSize: 14, fontWeight: 700 } // Clusters
  },
  COLORS: {
    stroke: '#000000',
    fill: '#FFFFFF'
  },
  ANIM: {
    flyToDuration: 0.8, // segundos
    sheetDelay: 1000 // milisegundos
  },
  ZOOMS: {
    movilidad: 12,
    arquitectura: 15,
    contacto: 14
  },
  CENTER: {
    contact: [48.8226, 2.4747]
  }
};
