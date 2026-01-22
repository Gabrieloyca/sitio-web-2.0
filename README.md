# Portfolio – Gabriel Oyarzun

Sitio web estático que muestra el mapa interactivo y la información base del portafolio profesional de Gabriel Oyarzun.

## Estructura

```
.
├── assets/
│   ├── css/           # Estilos globales y de componentes
│   ├── images/        # Iconografía y retratos utilizados por la interfaz
│   └── js/            # Scripts del mapa Leaflet y la navegación
└── index.html         # Entrada principal del sitio
```

Cada página HTML incluye los estilos de `assets/css` y la lógica específica en `assets/js`. La inicialización del mapa se centraliza en `assets/js/map-common.js` para reutilizar el mismo comportamiento en las diferentes vistas.

## Desarrollo

1. Levanta un servidor estático (por ejemplo con `python -m http.server`) en la raíz del proyecto.
2. Abre `http://localhost:8000` en tu navegador.
3. Modifica o añade archivos dentro de `assets/css`, `assets/js` o `assets/images` según sea necesario.

Los iconos personalizados (home, puntero y pin del mapa) se encuentran en `assets/images`. Puedes reemplazarlos por versiones definitivas manteniendo el mismo nombre de archivo para que la interfaz los reconozca automáticamente.

## Dependencias externas

- [Leaflet](https://leafletjs.com/) para el mapa base.
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) para la agrupación de marcadores.
- Fuente [Inter](https://fonts.google.com/specimen/Inter) desde Google Fonts.

Estas dependencias se cargan desde CDN y no requieren instalación adicional.

## Checklist de QA

- [ ] Probado en 320/768/1024/1440.
- [ ] Probado pinch-zoom mobile (simulado).
- [ ] Sin errores en consola.
- [ ] Rutas relativas ok para GitHub Pages.
