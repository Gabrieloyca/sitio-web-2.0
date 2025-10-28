# Portfolio – Gabriel Oyarzun

Sitio web estático que muestra el mapa interactivo y la información base del portafolio profesional de Gabriel Oyarzun.

## Estructura

```
.
├── assets/
│   └── images/        # Iconografía y retrato estilizado utilizados por la interfaz
├── css/
│   └── main.css       # Estilos globales del sitio
├── js/
│   └── app.js         # Lógica de la interfaz y del mapa Leaflet
└── index.html         # Entrada principal del sitio
```

La navegación está generada dinámicamente desde `js/app.js` para que sea sencillo agregar nuevas páginas. Cada pantalla debe declararse con `data-screen="{id}"` en el HTML y añadirse a la configuración `NAV_ITEMS` en el script.

## Desarrollo

1. Levanta un servidor estático (por ejemplo con `python -m http.server`) en la raíz del proyecto.
2. Abre `http://localhost:8000` en tu navegador.
3. Modifica o añade archivos dentro de `css/`, `js/` o `assets/` según sea necesario.

Los iconos personalizados (home, puntero y pin del mapa) se encuentran en `assets/images`. Puedes reemplazarlos por versiones definitivas manteniendo el mismo nombre de archivo para que la interfaz los reconozca automáticamente.

## Dependencias externas

- [Leaflet](https://leafletjs.com/) para el mapa base.
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) para la agrupación de marcadores.
- Fuente [Inter](https://fonts.google.com/specimen/Inter) desde Google Fonts.

Estas dependencias se cargan desde CDN y no requieren instalación adicional.
