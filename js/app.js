/* global L */
(function () {
  'use strict';

  const CONFIG = window.APP_CONFIG || {};
  const PIN_CONFIG = CONFIG.PIN || {};
  const COLOR_CONFIG = CONFIG.COLORS || {};
  const ANIM_CONFIG = CONFIG.ANIM || {};
  const ZOOM_CONFIG = CONFIG.ZOOMS || {};
  const CENTER_CONFIG = CONFIG.CENTER || {};

  const FLY_DURATION = typeof ANIM_CONFIG.flyToDuration === 'number' ? ANIM_CONFIG.flyToDuration : 0.8;
  const SHEET_DELAY = typeof ANIM_CONFIG.sheetDelay === 'number' ? ANIM_CONFIG.sheetDelay : 1000;

  function syncDesignTokens() {
    const root = document.documentElement;
    if (!root || !root.style) {
      return;
    }
    const style = root.style;
    const setPx = (name, value) => {
      if (typeof value === 'number') {
        style.setProperty(name, `${value}px`);
      }
    };
    setPx('--pin-chef-d', PIN_CONFIG.chef && PIN_CONFIG.chef.diameter);
    setPx('--pin-chef-b', PIN_CONFIG.chef && PIN_CONFIG.chef.border);
    setPx('--pin-charge-d', PIN_CONFIG.charge && PIN_CONFIG.charge.diameter);
    setPx('--pin-charge-b', PIN_CONFIG.charge && PIN_CONFIG.charge.border);
    setPx('--cluster-d', PIN_CONFIG.cluster && PIN_CONFIG.cluster.diameter);
    setPx('--cluster-b', PIN_CONFIG.cluster && PIN_CONFIG.cluster.border);
    if (PIN_CONFIG.cluster && typeof PIN_CONFIG.cluster.fontSize === 'number') {
      style.setProperty('--cluster-font', `${PIN_CONFIG.cluster.fontSize}px`);
    }
    if (PIN_CONFIG.cluster && typeof PIN_CONFIG.cluster.fontWeight !== 'undefined') {
      style.setProperty('--cluster-weight', String(PIN_CONFIG.cluster.fontWeight));
    }
    if (COLOR_CONFIG.stroke) {
      style.setProperty('--color-stroke', COLOR_CONFIG.stroke);
    }
    if (COLOR_CONFIG.fill) {
      style.setProperty('--color-fill', COLOR_CONFIG.fill);
    }
  }

  syncDesignTokens();

  const HAND_FALLBACK = `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128' shape-rendering='crispEdges'><path fill='%23111' d='M44 12h16v44H44zM60 24h16v48H60zM76 36h16v52H76zM28 40h16v76H28zM12 60h16v56H12z'/></svg>")}")`;
  const PORTRAIT_FALLBACK = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAYAAAAp8mGQAAAACXBIWXMAAAsSAAALEgHS3X78AAABa0lEQVR4nO2Ty0scURTHf4l8m1x3R4ZpZpJm0hYVQkqC7E7g6cG8i4bW0QW4H9bTWeWlS6m1W3qQm2pQGgE0iOtiB6Q6FQmFxG3P3j7c8c8gZb9l6H1zv1z9v+8c9wqk2m1q1r8d4s2k7eS6Wn8Qwz7M2VgU8bYy8n9lC1P5B0KpYx/7y8m3p1O3YqZ1H1o1Y3b3s8rXwq4Qk5P9+dnI9b7cO3zQkQXq9YkF8M0vG3Fovh3vQpG8Xx9yH0lAr+oQ4YbV8cL3ZrR4Vf1o9j9z1bX3G9pQ6J4ZpB1W4vG1Qij0Uo0dM7Q6Wj2X7oJp0mCw2oJr0kIhTUZ0wE0lCwU0yWJ6YlQn8W9wq0W6u2G6m3U4g4d8J2C+5x1YxV8eR3r1hH2p6b0aJd0nOe9w1sQYl5x9m8v3p5pB6c8S9mQJ+7K1qkF5i8S1w5pX4r8q+6D3/9k9u3w8P6j6v+zV3YtHjP5jY5vYF0iG6iH3s5H1k0iGx9Y8dA0uVyc1J5pQAAAABJRU5ErkJggg==")`;

  const HAND_ICON_URL = 'assets/images/hand-pointer.svg';
  const PORTRAIT_URL = 'assets/images/portrait-gabriel.svg';

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

  const mapContainer = document.getElementById('map');

  const map = L.map('map', { zoomControl: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    opacity: 0.96,
    attribution: '&copy; OpenStreetMap, &copy; CARTO'
  }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    opacity: 0.4
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  map.scrollWheelZoom.disable();

  function scheduleMapInvalidate(delay = 0) {
    const run = () => requestAnimationFrame(() => map.invalidateSize());
    if (delay > 0) {
      setTimeout(run, delay);
    } else {
      run();
    }
  }

  const handleResize = () => scheduleMapInvalidate();
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      scheduleMapInvalidate();
    }
  });

  let wheelMode = 'disabled';

  function enableWheelOnHover() {
    if (wheelMode === 'hover') {
      map.scrollWheelZoom.enable();
    }
  }

  function disableWheelOnLeave() {
    if (wheelMode === 'hover') {
      map.scrollWheelZoom.disable();
    }
  }

  function setWheelMode(mode) {
    if (wheelMode === mode) {
      return;
    }
    if (mapContainer) {
      mapContainer.removeEventListener('mouseenter', enableWheelOnHover);
      mapContainer.removeEventListener('mouseleave', disableWheelOnLeave);
    }
    wheelMode = mode;
    if (mode === 'enabled') {
      map.scrollWheelZoom.enable();
    } else if (mode === 'hover') {
      map.scrollWheelZoom.disable();
      if (mapContainer) {
        mapContainer.addEventListener('mouseenter', enableWheelOnHover);
        mapContainer.addEventListener('mouseleave', disableWheelOnLeave);
      }
    } else {
      map.scrollWheelZoom.disable();
    }
  }

  const HOME_CENTER = [47.1, 2.6];
  const HOME_ZOOM = 5.4;
  const PROJECT_CENTER = [46.6, 2.6];
  const PROJECT_ZOOM = typeof ZOOM_CONFIG.mobilite === 'number' ? ZOOM_CONFIG.mobilite : 6;
  const PUBLICATION_CENTER = [23, 4];
  const PUBLICATION_ZOOM = 3;
  const DETAIL_FALLBACK_ZOOM = 9.2;

  const ARCHITECTURE_CENTER = [-33.4, -70.8];
  const ARCHITECTURE_ZOOM = typeof ZOOM_CONFIG.architecture === 'number' ? ZOOM_CONFIG.architecture : 5.5;
  const CONTACT_CENTER = Array.isArray(CENTER_CONFIG.contact) ? CENTER_CONFIG.contact : [48.8226, 2.4747];
  const CONTACT_ZOOM = typeof ZOOM_CONFIG.contact === 'number' ? ZOOM_CONFIG.contact : 14;

  const BOUNDARY_BASE_PATH = 'data/geojson/france/';
  const PROJECT_BOUNDARIES = {
    agen: 'AGEN.geojson',
    amiens: 'AMIENS.geojson',
    bourget: 'BOURGET-LE-LAC.geojson',
    'grand-libournais': 'LIBOURNAIS.geojson',
    provins: 'PROVINS.geojson',
    rouen: 'ROUEN.geojson',
    'saint-herblain': 'SAINT-HERBLAIN.geojson',
    'saint-medard': 'SAINT-MEDARD-EN-JALLES.geojson',
    'saint-sebastien': 'SAINT-SEBASTIEN-SUR-LOIRE.geojson',
    talence: 'TALENCE.geojson',
    veligo: 'IDF.geojson',
    'ville-30': 'IDF.geojson',
    vexin: 'VEXIN.geojson'
  };

  const boundaryCache = new Map();
  let activeBoundaryLayer = null;

  function escapeXml(str = '') {
    return String(str).replace(/[&<>'"]/g, (char) => {
      switch (char) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        default:
          return char;
      }
    });
  }

  function createPlaceholder(label, { colors = ['#0f172a', '#1e293b'], orientation = 'square' } = {}) {
    const [width, height] = orientation === 'portrait' ? [900, 1280] : [960, 960];
    const radius = orientation === 'portrait' ? 68 : 60;
    const fontSize = orientation === 'portrait' ? 64 : 70;
    const textY = height / 2 + fontSize / 3;
    const safeLabel = escapeXml(label);
    const gradientId = `grad-${Math.random().toString(36).slice(2)}`;
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
        <defs>
          <linearGradient id='${gradientId}' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stop-color='${colors[0]}' />
            <stop offset='100%' stop-color='${colors[1]}' />
          </linearGradient>
        </defs>
        <rect x='0' y='0' width='${width}' height='${height}' rx='${radius}' fill='url(#${gradientId})' />
        <text x='50%' y='${textY}' font-family='Inter, Arial, sans-serif' font-size='${fontSize}' font-weight='600' text-anchor='middle' fill='rgba(255,255,255,0.92)'>${safeLabel}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  const projects = [
    {
      id: 'penvenan',
      title: 'Plan de circulation et de stationnement de Penvénan',
      year: '2024',
      client: 'ANCT',
      partner: null,
      role: 'chef',
      type: 'Étude de circulation / stationnement',
      description:
        'Réalisation d’un diagnostic multimodal fin (trafic, vitesses, stationnement, modes actifs) pour objectiver les dysfonctionnements par secteur. Conception et animation d’ateliers de concertation afin de prioriser les enjeux et partager les arbitrages. Élaboration d’un plan d’actions opérationnel et phasé, avec premières estimations de coûts et indicateurs de suivi.',
      skills: ['concertation', 'analyse de flux', 'planification stratégique', 'SIG', 'chiffrage'],
      coords: [48.8, -3.3]
    },
    {
      id: 'yvelines',
      title: 'Stationnements cycles et modes actifs – Collèges des Yvelines',
      year: '2024',
      client: 'Conseil Départemental des Yvelines',
      partner: null,
      role: 'chef',
      type: 'Étude de stationnement cyclable',
      description:
        'Diagnostic détaillé de l’offre et de la demande de stationnement vélo dans et autour des établissements, complété par un bilan AFOM. Conception de solutions adaptées aux contextes (sécurisation, capacité, accessibilité) avec schémas d’implantation. Chiffrage des variantes et priorisation à court/moyen terme pour faciliter la décision.',
      skills: ['aménagement cyclable', 'AFOM', 'estimation financière', 'cartographie', 'cadrage technique'],
      coords: [48.8, 1.8]
    },
    {
      id: 'provins',
      title: 'Flux et stationnement – Gare de Provins',
      year: '2023',
      client: 'Conseil Développement Habitat Urbanisme',
      partner: null,
      role: 'charge',
      type: 'Étude de flux / stationnement',
      description:
        'Conception et déploiement d’une enquête de stationnement multi-périodes autour de la gare pour mesurer la pression et la rotation. Traitement statistique et spatial des résultats, avec mise en évidence des zones critiques et des transferts potentiels. Recommandations pragmatiques (réglementation, jalonnement, extensions) avec calendrier de mise en œuvre.',
      skills: ['enquêtes terrain', 'data analysis', 'SIG', 'restitution synthétique'],
      coords: [48.55, 3.3]
    },
    {
      id: 'bourget',
      title: 'Impacts des projets Triangle Sud & Hameau des Granges – Le Bourget-du-Lac',
      year: '2023',
      client: 'Commune du Bourget-du-Lac',
      partner: null,
      role: 'chef',
      type: 'Étude d’impact circulation',
      description:
        'Évaluation des effets cumulés des programmes immobiliers sur la RD1504 et ses carrefours clés. Analyse de la réserve de capacité d’un giratoire et d’intersections prioritaires selon plusieurs hypothèses de montée en charge. Proposition d’aménagements d’optimisation et de modalités de suivi après mise en service.',
      skills: ['modélisation trafic', 'évaluation capacitaire', 'ingénierie routière', 'scénarios'],
      coords: [45.65, 5.87]
    },
    {
      id: 'saint-medard',
      title: 'Plan de circulation – Saint-Médard-en-Jalles (Bordeaux Métropole)',
      year: '2023',
      client: 'Bordeaux Métropole',
      partner: null,
      role: 'charge',
      type: 'Étude de circulation',
      description:
        'Analyse comparative des scénarios de plan de circulation en intégrant redistributions de flux, temps de parcours et apaisement. Repérage des effets collatéraux (report, nuisances) et identification de mesures d’accompagnement modes actifs/TC. Support cartographique et indicateurs pour éclairer l’arbitrage politique.',
      skills: ['simulation trafic', 'analyse scénariale', 'SIG', 'aide à la décision'],
      coords: [44.9, -0.72]
    },
    {
      id: 'rouen',
      title: 'Étude de mobilité périurbaine – Quadrants MRN (Métropole de Rouen)',
      year: '2024',
      client: 'Métropole de Rouen',
      partner: null,
      role: 'chef',
      type: 'Accessibilité & intermodalité',
      description:
        'Diagnostic de l’offre/demande en secteurs peu denses, avec focus sur TC, covoiturage et rabattements. Construction de scénarios multimodaux par quadrant, hiérarchisés selon leur faisabilité et leur impact. Évaluation du potentiel d’usage et recommandations d’outillage (information, tarification, services).',
      skills: ['planification des mobilités', 'scénarisation', 'diagnostic territorial', 'évaluation'],
      coords: [49.44, 1.1]
    },
    {
      id: 'tram-train-lyon',
      title: 'Tram-Train de l’Ouest lyonnais – Étude de rabattement',
      year: '2023',
      client: 'Métropole du Grand Lyon',
      partner: null,
      role: 'charge',
      type: 'Intermodalité',
      description:
        'Visites in situ, entretiens et analyse de données pour caractériser les accès en gare (piéton, vélo, bus, VP). Identification des « chaînons manquants » et des leviers rapides (jalonnement, stationnement vélo, reconfigurations douces). Pré-programme d’actions coordonné avec l’offre TC.',
      skills: ['observation terrain', 'intermodalité', 'audit d’accessibilité', 'SIG'],
      coords: [45.77, 4.83]
    },
    {
      id: 'amiens',
      title: 'Schéma directeur cyclable – Pôle métropolitain du Grand Amiénois',
      year: '2024',
      client: 'PMGA',
      partner: null,
      role: 'chef',
      type: 'Schéma directeur',
      description:
        'Définition d’un réseau hiérarchisé (quotidien/loisir) et de fiches action thématiques (stationnement, jalonnement, continuités). Priorisation selon enjeux de sécurité, connexions structurantes et coût/effet. Production de supports cartographiques prêts à l’appropriation politique.',
      skills: ['planification cyclable', 'hiérarchisation', 'stratégie territoriale', 'cartographie'],
      coords: [49.9, 2.3]
    },
    {
      id: 'saint-herblain',
      title: 'Sécurisation des modes actifs – Pont Truin (Saint-Herblain, Nantes Métropole)',
      year: '2024',
      client: 'Nantes Métropole',
      partner: null,
      role: 'chef',
      type: 'Modes actifs',
      description:
        'Diagnostic de circulation et de sécurité autour du pont, avec test d’un feu alterné et variantes d’aménagement cyclable. Étude des impacts sur le trafic VP et la sécurité des usagers vulnérables. Recommandations phasées conciliant performance et apaisement.',
      skills: ['sécurité routière', 'faisabilité technique', 'AMO modes actifs'],
      coords: [47.22, -1.65]
    },
    {
      id: 'val-de-saone',
      title: 'Aménagements cyclables – Abords des gares du Val de Saône',
      year: '2024',
      client: 'Métropole de Lyon',
      partner: null,
      role: 'charge',
      type: 'Pré-faisabilité',
      description:
        'Estimations de fréquentation par année de DSP et cadrage d’itinéraires cyclables d’accès aux gares. Appui à la réponse Transdev : arbitrages techniques, phasage et réponses aux questions du dossier.',
      skills: ['prévision de fréquentation', 'mobilité douce', 'DSP', 'cadrage offre'],
      coords: [45.86, 4.82]
    },
    {
      id: 'rive-droite-rhone',
      title: 'Service ferroviaire – Rive Droite du Rhône (SNCF Réseau)',
      year: '2021–2022',
      client: 'SNCF Réseau',
      partner: null,
      role: 'charge',
      type: 'Potentiel de fréquentation',
      description:
        'Exploitation d’un modèle multimodal régional pour estimer la fréquentation selon plusieurs hypothèses d’offre. Analyse de sensibilité et recommandations sur les points de vigilance (horaires, correspondances, rabattements).',
      skills: ['modélisation transport', 'analyse de données', 'SIG'],
      coords: [45.69, 4.83]
    },
    {
      id: 'talence',
      title: 'Liaison cyclable – Talence (Bordeaux Métropole)',
      year: '2023',
      client: 'Bordeaux Métropole',
      partner: null,
      role: 'chef',
      type: 'Étude cyclable',
      description:
        'Diagnostic des discontinuités et conception de scénarios pour relier le Cours de Gallieni au Forum de Talence. Évaluation multicritère (sécurité, lisibilité, coût) et proposition d’un tracé prioritaire.',
      skills: ['conception cyclable', 'scénarios', 'évaluation', 'cartographie'],
      coords: [44.81, -0.59]
    },
    {
      id: 'vexin',
      title: 'Plan de Mobilité Simplifié – Vexin Centre (Marines)',
      year: '2025',
      client: 'CC Vexin Centre',
      partner: null,
      role: 'chef',
      type: 'PDMS',
      description:
        'Diagnostic territorial (usages, offre, contraintes) et définition d’une stratégie de mobilité à l’échelle intercommunale, avec fiches actions. Concertation ciblée et outillage pour le suivi (indicateurs, gouvernance).',
      skills: ['planification stratégique', 'concertation', 'SIG', 'rédaction'],
      coords: [49.2, 1.7]
    },
    {
      id: 'grand-libournais',
      title: 'SCoT du Grand Libournais – Volet mobilité',
      year: '2024',
      client: 'Syndicat du SCoT Grand Libournais',
      partner: null,
      role: 'charge',
      type: 'Étude stratégique',
      description:
        'Analyse d’enquêtes et benchmark des PADD pour harmoniser objectifs de mobilité et sobriété. Contributions rédactionnelles sur les orientations et les cartes d’enjeux.',
      skills: ['analyse stratégique', 'prospective', 'rédaction urbaine'],
      coords: [44.92, -0.24]
    },
    {
      id: 'agen',
      title: 'SCoT & PLUi-HD d’Agen – Volet mobilité',
      year: '2024',
      client: 'Agglomération d’Agen',
      partner: null,
      role: 'charge',
      type: 'Urbanisme réglementaire',
      description:
        'Diagnostic multimodal complet et participation aux pièces PASS, PADD et OAP Mobilité. Alignement des ambitions mobilité/urbanisme et cartographie des principes d’aménagement.',
      skills: ['urbanisme', 'mobilité', 'rédaction', 'SIG'],
      coords: [44.2, 0.62]
    },
    {
      id: 'pan-lou',
      title: 'Impact circulation – Déchèterie « Pan Lou » (Nantes Métropole)',
      year: '2024',
      client: 'Nantes Métropole',
      partner: null,
      role: 'chef',
      type: 'Étude d’impact',
      description:
        'Mesure de la situation de référence (sans projet) et simulation avec ouverture de la déchèterie aux heures de pointe. Estimation des saturations, proposition d’optimisations d’accès et modalités de suivi post-mise en service.',
      skills: ['modélisation trafic', 'diagnostic horaire', 'phasage d’aménagement'],
      coords: [47.22, -1.55]
    },
    {
      id: 'ville-30',
      title: 'Ville 30 – Métropole de Lyon',
      year: '2024',
      client: 'Métropole de Lyon',
      partner: null,
      role: 'chef',
      type: 'Analyse de vitesses',
      description:
        'Suivi de l’évolution des vitesses dans 13 communes périphériques et analyse de comptages pour 3 d’entre elles. Production de fiches cartographiques standardisées pour faciliter la comparaison et le pilotage.',
      skills: ['data analyse', 'visualisation', 'reporting', 'mobilité urbaine'],
      coords: [45.75, 4.85]
    },
    {
      id: 'veligo',
      title: 'Véligo Location – Appel d’offre Transdev',
      year: '2023',
      client: 'Transdev',
      partner: null,
      role: 'chef',
      type: 'Étude de marché vélo',
      description:
        'Construction d’un indicateur de cyclabilité pour toute l’Île-de-France (VAE et vélos classiques). Analyse clients et facteurs de souscription pour dimensionner l’offre et estimer les parts de marché des nouvelles formules.',
      skills: ['data science mobilité', 'étude de marché', 'indicateurs', 'stratégie'],
      coords: [48.85, 2.35]
    },
    {
      id: 'valenciennes',
      title: 'Plan de Mobilité du Valenciennois (SIMOUV)',
      year: '2023',
      client: 'SIMOUV',
      partner: null,
      role: 'charge',
      type: 'Étude de mobilité',
      description:
        'Diagnostic des mobilités cyclables, piétonnes et solidaires avec cartographie des manques de desserte. Recommandations ciblées pour renforcer l’accessibilité et l’inclusion.',
      skills: ['diagnostic territorial', 'mobilité inclusive', 'cartographie', 'priorisation'],
      coords: [50.36, 3.52]
    },
    {
      id: 'caluire',
      title: 'Insertion des Voies lyonnaises – Caluire-et-Cuire',
      year: '2023',
      client: 'Métropole du Grand Lyon',
      partner: null,
      role: 'charge',
      type: 'Étude d’impact',
      description:
        'Analyse des scénarios d’aménagement des voiries et de leurs impacts sur le trafic et la sécurité. Appui à l’arbitrage entre performance circulatoire et confort des modes actifs.',
      skills: ['ingénierie voirie', 'simulation', 'SIG', 'évaluation'],
      coords: [45.8, 4.83]
    },
    {
      id: 'oullins',
      title: 'Insertion de la Voie lyonnaise 6 – Oullins & Saint-Genis-Laval',
      year: '2023',
      client: 'Métropole du Grand Lyon',
      partner: null,
      role: 'charge',
      type: 'Étude d’impact',
      description:
        'Étude comparative des scénarios et identification des points sensibles (capacités, traversées, continuités cyclables). Recommandations d’aménagements et phasage.',
      skills: ['mobilité urbaine', 'simulation', 'analyse comparative', 'SIG'],
      coords: [45.71, 4.81]
    },
    {
      id: 'impact-velo',
      title: 'Étude socio-économique – Impact du vélo en France (ADEME)',
      year: '2025',
      client: 'ADEME',
      partner: '6t-bureau de recherche',
      role: 'chef',
      type: 'Étude nationale',
      description:
        'Coordination éditoriale et rédaction des chapitres « impacts directs et indirects » avec cadrage bibliographique et exploitation de données nationales. Définition d’un cadre d’évaluation robuste et transparent mobilisable par les acteurs publics.',
      skills: ['économie des transports', 'coordination scientifique', 'analyse d’impact', 'méta-revue'],
      coords: [46.6, 2.3]
    }
  ];

  const architectureProjects = [
    {
      id: 'casa-palta',
      title: 'Casa Palta',
      commune: 'Quillota',
      summary: 'Projet résidentiel entouré de vergers',
      coords: [-32.883, -71.247],
      zoom: 13,
      architects: ['Gabriel Oyarzun', 'Lucas Cerda'],
      collaborators: ['Gustavo Atica'],
      engineering: 'XX et XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Accès depuis les vergers',
          square: createPlaceholder('Casa Palta', { colors: ['#0f172a', '#334155'] }),
          portrait: createPlaceholder('Casa Palta', {
            colors: ['#0f172a', '#1f2937'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Séjour intérieur',
          square: createPlaceholder('Séjour', { colors: ['#7c3aed', '#312e81'] }),
          portrait: createPlaceholder('Séjour', {
            colors: ['#6d28d9', '#1f2937'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Patio en lumière',
          square: createPlaceholder('Patio', { colors: ['#0f766e', '#0f172a'] }),
          portrait: createPlaceholder('Patio', {
            colors: ['#0f766e', '#1e293b'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Volume de nuit',
          square: createPlaceholder('Nocturne', { colors: ['#f97316', '#9a3412'] }),
          portrait: createPlaceholder('Nocturne', {
            colors: ['#ea580c', '#0f172a'],
            orientation: 'portrait'
          })
        }
      ]
    },
    {
      id: 'atelier-santiago',
      title: 'Atelier Matta',
      commune: 'Santiago Centro',
      summary: 'Rénovation d’un espace de travail artistique',
      coords: [-33.45, -70.666],
      zoom: 14,
      architects: ['Gabriel Oyarzun'],
      collaborators: ['Collectif Matta'],
      engineering: 'XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Atelier ouvert',
          square: createPlaceholder('Atelier', { colors: ['#dc2626', '#7f1d1d'] }),
          portrait: createPlaceholder('Atelier', {
            colors: ['#991b1b', '#111827'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Espace d’exposition',
          square: createPlaceholder('Expo', { colors: ['#2563eb', '#1e3a8a'] }),
          portrait: createPlaceholder('Expo', {
            colors: ['#1d4ed8', '#0f172a'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Détails matières',
          square: createPlaceholder('Texture', { colors: ['#fb7185', '#be123c'] }),
          portrait: createPlaceholder('Texture', {
            colors: ['#f43f5e', '#7f1d1d'],
            orientation: 'portrait'
          })
        }
      ]
    },
    {
      id: 'las-condes-panorama',
      title: 'Panorama Andes',
      commune: 'Las Condes',
      summary: 'Penthouse panoramique',
      coords: [-33.4105, -70.566],
      zoom: 14,
      architects: ['Gabriel Oyarzun'],
      collaborators: ['Équipe locale'],
      engineering: 'XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Salon sur la cordillère',
          square: createPlaceholder('Cordillère', { colors: ['#0284c7', '#0f172a'] }),
          portrait: createPlaceholder('Cordillère', {
            colors: ['#0ea5e9', '#0f172a'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Terrasse végétalisée',
          square: createPlaceholder('Terrasse', { colors: ['#22c55e', '#15803d'] }),
          portrait: createPlaceholder('Terrasse', {
            colors: ['#16a34a', '#0f172a'],
            orientation: 'portrait'
          })
        }
      ]
    },
    {
      id: 'las-condes-masesmas',
      title: 'Studio Masesmas',
      commune: 'Las Condes',
      summary: 'Régularisation du petit studio',
      coords: [-33.425, -70.563],
      zoom: 15,
      architects: ['Gabriel Oyarzun'],
      collaborators: ['Équipe masesmas'],
      engineering: 'XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Micro-espace optimisé',
          square: createPlaceholder('Studio', { colors: ['#facc15', '#ca8a04'] }),
          portrait: createPlaceholder('Studio', {
            colors: ['#f59e0b', '#92400e'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Cuisine compacte',
          square: createPlaceholder('Cuisine', { colors: ['#f97316', '#c2410c'] }),
          portrait: createPlaceholder('Cuisine', {
            colors: ['#f97316', '#7c2d12'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Espace nuit',
          square: createPlaceholder('Repos', { colors: ['#a855f7', '#6b21a8'] }),
          portrait: createPlaceholder('Repos', {
            colors: ['#9333ea', '#581c87'],
            orientation: 'portrait'
          })
        }
      ]
    },
    {
      id: 'las-condes-tiny',
      title: 'Tiny House El Encuentro',
      commune: 'Las Condes',
      summary: 'Micro-habitat expérimental',
      coords: [-33.403, -70.552],
      zoom: 15,
      architects: ['Gabriel Oyarzun'],
      collaborators: ['Laboratoire Habitat'],
      engineering: 'XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Module compact',
          square: createPlaceholder('Tiny', { colors: ['#38bdf8', '#0f172a'] }),
          portrait: createPlaceholder('Tiny', {
            colors: ['#0ea5e9', '#082f49'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Intérieur modulable',
          square: createPlaceholder('Modulable', { colors: ['#14b8a6', '#0f172a'] }),
          portrait: createPlaceholder('Modulable', {
            colors: ['#0d9488', '#0f172a'],
            orientation: 'portrait'
          })
        }
      ]
    },
    {
      id: 'lo-barnechea-casa',
      title: 'Maison Quebrada',
      commune: 'Lo Barnechea',
      summary: 'Résidence sur la pente andine',
      coords: [-33.356, -70.505],
      zoom: 14,
      architects: ['Gabriel Oyarzun'],
      collaborators: ['Gustavo Atica'],
      engineering: 'XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Structure suspendue',
          square: createPlaceholder('Structure', { colors: ['#0ea5e9', '#1d4ed8'] }),
          portrait: createPlaceholder('Structure', {
            colors: ['#2563eb', '#1e3a8a'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Espaces extérieurs',
          square: createPlaceholder('Extérieurs', { colors: ['#f472b6', '#db2777'] }),
          portrait: createPlaceholder('Extérieurs', {
            colors: ['#ec4899', '#831843'],
            orientation: 'portrait'
          })
        }
      ]
    },
    {
      id: 'estacion-central-hub',
      title: 'Hub créatif Estación Central',
      commune: 'Estación Central',
      summary: 'Réhabilitation d’un ancien entrepôt',
      coords: [-33.456, -70.704],
      zoom: 14,
      architects: ['Gabriel Oyarzun'],
      collaborators: ['Collectif Urbain'],
      engineering: 'XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Façade récupérée',
          square: createPlaceholder('Façade', { colors: ['#f59e0b', '#b45309'] }),
          portrait: createPlaceholder('Façade', {
            colors: ['#d97706', '#92400e'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Cour partagée',
          square: createPlaceholder('Cour', { colors: ['#65a30d', '#166534'] }),
          portrait: createPlaceholder('Cour', {
            colors: ['#84cc16', '#14532d'],
            orientation: 'portrait'
          })
        }
      ]
    },
    {
      id: 'pucon-lodge',
      title: 'Lodge Pucon',
      commune: 'Pucón',
      summary: 'Retraite au bord du lac Villarrica',
      coords: [-39.28, -71.96],
      zoom: 13,
      architects: ['Gabriel Oyarzun'],
      collaborators: ['Atelier Sud'],
      engineering: 'XX',
      electricity: 'XX',
      water: 'XX',
      photos: [
        {
          caption: 'Vue sur le lac',
          square: createPlaceholder('Lac', { colors: ['#0ea5e9', '#312e81'] }),
          portrait: createPlaceholder('Lac', {
            colors: ['#1d4ed8', '#1e3a8a'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Salon au coin du feu',
          square: createPlaceholder('Cheminée', { colors: ['#ef4444', '#7f1d1d'] }),
          portrait: createPlaceholder('Cheminée', {
            colors: ['#b91c1c', '#450a0a'],
            orientation: 'portrait'
          })
        },
        {
          caption: 'Galerie extérieure',
          square: createPlaceholder('Galerie', { colors: ['#0f766e', '#0f172a'] }),
          portrait: createPlaceholder('Galerie', {
            colors: ['#0f766e', '#0b1120'],
            orientation: 'portrait'
          })
        }
      ]
    }
  ];

  const clusterSize = pinSizeFor('cluster');
  const clusterDiameter = clusterSize.diameter || 36;

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    maxClusterRadius: Math.max(40, clusterDiameter * 1.4),
    iconCreateFunction(clusterGroup) {
      const count = clusterGroup.getChildCount();
      return L.divIcon({
        html: `<span class="map-cluster__count">${count}</span>`,
        className: 'map-cluster',
        iconSize: [clusterDiameter, clusterDiameter],
        iconAnchor: [clusterDiameter / 2, clusterDiameter / 2]
      });
    }
  });

  const architectureLayer = L.layerGroup();
  let architectureRevealTimeout = null;
  let architecturePhotoTimers = [];

  function pinSizeFor(role) {
    const config = PIN_CONFIG[role] || PIN_CONFIG.charge || { diameter: 22, border: 3 };
    return {
      diameter: typeof config.diameter === 'number' ? config.diameter : 22,
      border: typeof config.border === 'number' ? config.border : 3
    };
  }

  function createPinDivIcon(role) {
    const size = pinSizeFor(role);
    const diameter = size.diameter;
    const classList = ['map-pin', `map-pin--${role}`];
    if (role !== 'chef' && role !== 'charge') {
      classList.push('map-pin--architecture');
    }
    return L.divIcon({
      html: `<span class="${classList.join(' ')}" aria-hidden="true"></span>`,
      className: 'map-pin-wrapper',
      iconSize: [diameter, diameter],
      iconAnchor: [diameter / 2, diameter / 2],
      popupAnchor: [0, -diameter / 2]
    });
  }

  const pinIcons = {
    chef: createPinDivIcon('chef'),
    charge: createPinDivIcon('charge'),
    architecture: createPinDivIcon('architecture')
  };

  const projectStats = projects.reduce(
    (acc, project) => {
      if (project.role === 'chef') {
        acc.chef += 1;
      } else {
        acc.charge += 1;
      }
      return acc;
    },
    { chef: 0, charge: 0 }
  );

  const statCharge = document.getElementById('statCharge');
  const statChef = document.getElementById('statChef');
  if (statCharge && statChef) {
    statCharge.textContent = projectStats.charge.toString();
    statChef.textContent = projectStats.chef.toString();
  }

  function formatRole(role) {
    return role === 'chef' ? 'Chef de projet' : 'Chargé d’études';
  }

  function createProjectPopup(project) {
    const partnerLine = project.partner ? `<br /><strong>Partenaire :</strong> ${project.partner}` : '';
    return `
      <strong>${project.title}</strong><br />
      <em>${project.type}</em><br />
      ${project.year} – ${project.client}<br />
      <strong>Rôle :</strong> ${formatRole(project.role)}${partnerLine}
    `;
  }

  const publications = [
    {
      id: 'bumpy-ride',
      journal: 'Journal of Transport Geography',
      issue: 'Volume 99, February 2021, 102964',
      title:
        'A bumpy ride: structural inequalities, quality standards, and institutional limitations affecting cycling infrastructure',
      authors: 'Rodrigo Mora, Tomás Maya, Gabriel Oyarzun, Majo Vergara, Giovanni Vecchio',
      doi: 'https://doi.org/10.1016/j.jtrangeo.2021.102964',
      coverTone: '#0f705a'
    },
    {
      id: 'equity-cycling',
      journal: 'Journal of Transport Geography',
      issue: 'Volume 99, February 2021, 102964',
      title: 'Equity and accessibility of cycling infrastructure: An analysis of Santiago de Chile',
      authors: 'Rodrigo Mora, Ricardo Truffello, Gabriel Oyarzun',
      doi: 'https://doi.org/10.1016/j.jtrangeo.2021.102964',
      coverTone: '#145b8d'
    },
    {
      id: 'impact-velo-france',
      journal: 'Rapport ADEME',
      issue: 'Volume 99, February 2021, 102964',
      title: 'Impact socioéconomique des usages du vélo en France',
      authors: 'Julia Janne, Nicolas Lovelard, Gabriel Oyarzun, Nadia Kahbazi, 6T Bureau de Recherche, Explain',
      doi: 'https://www.ademe.fr',
      coverTone: '#b3474a'
    },
    {
      id: 'territoires-mobilites',
      journal: 'Revue des Territoires',
      issue: 'Hors-série Mobilités 2022',
      title: 'Faire territoire par la mobilité : étude comparative des métropoles françaises',
      authors: 'Claire Bernard, Thomas Giraud, Gabriel Oyarzun',
      doi: 'https://studio-territoires.fr/territoires-mobilites.pdf',
      coverTone: '#7c3aed'
    },
    {
      id: 'atelier-cyclable',
      journal: 'Actes des Ateliers du Vélo',
      issue: 'Édition 2023',
      title: 'Atteindre la massification des usages cyclables : leviers territoriaux',
      authors: 'Gabriel Oyarzun, Nadia Kahbazi',
      doi: 'https://studio-territoires.fr/atelier-velo.pdf',
      coverTone: '#059669'
    },
    {
      id: 'donnees-mobilite',
      journal: 'Observatoire des Données Mobilité',
      issue: 'Rapport annuel 2024',
      title: 'Structurer les données de mobilité du quotidien pour la décision publique',
      authors: 'Gabriel Oyarzun, Julien Roux, Alice Perrin',
      doi: 'https://studio-territoires.fr/donnees-mobilite-2024.pdf',
      coverTone: '#dc2626'
    },
    {
      id: 'ville-inclusive',
      journal: 'Cahiers de la Ville Inclusive',
      issue: 'N°7 – 2024',
      title: 'Mobilités inclusives : retours d’expérience de cinq intercommunalités',
      authors: 'Marion Lefort, Gabriel Oyarzun, SIMOUV',
      doi: 'https://studio-territoires.fr/ville-inclusive.pdf',
      coverTone: '#0ea5e9'
    },
    {
      id: 'climat-resilience',
      journal: 'Revue Climat & Territoires',
      issue: 'Dossier 2024',
      title: 'Résilience climatique des réseaux de mobilité secondaire',
      authors: 'Gabriel Oyarzun, Claire Bernard',
      doi: 'https://studio-territoires.fr/climat-resilience.pdf',
      coverTone: '#0284c7'
    },
    {
      id: 'veille-velo',
      journal: 'Observatoire Vélo & Territoires',
      issue: 'Cahier spécial 2023',
      title: 'Politiques cyclables départementales : leviers et retours d’expérience',
      authors: 'Nadia Kahbazi, Gabriel Oyarzun',
      doi: 'https://studio-territoires.fr/veille-velo.pdf',
      coverTone: '#4c1d95'
    },
    {
      id: 'mobilite-solidaire',
      journal: 'Mobilités Solidaires',
      issue: 'Rapport 2024',
      title: 'Co-construire une offre de mobilité solidaire en territoires périurbains',
      authors: 'SIMOUV, Gabriel Oyarzun',
      doi: 'https://studio-territoires.fr/mobilite-solidaire.pdf',
      coverTone: '#16a34a'
    },
    {
      id: 'territoires-actifs',
      journal: 'Les Cahiers des Territoires Actifs',
      issue: 'Numéro 12 – 2025',
      title: 'Indicateurs pour piloter la transition vers les mobilités actives',
      authors: 'Gabriel Oyarzun, Alice Perrin',
      doi: 'https://studio-territoires.fr/territoires-actifs.pdf',
      coverTone: '#fb923c'
    }
  ];

  const pubList = document.getElementById('pubList');

  function renderPublications() {
    if (!pubList) return;
    pubList.innerHTML = '';

    publications.forEach((pub) => {
      const article = document.createElement('article');
      article.className = 'pub-card';
      article.setAttribute('role', 'listitem');

      const journal = document.createElement('p');
      journal.className = 'pub-card__journal';
      journal.textContent = pub.journal;
      article.appendChild(journal);

      const issue = document.createElement('p');
      issue.className = 'pub-card__issue';
      issue.textContent = pub.issue;
      article.appendChild(issue);

      const title = document.createElement('h3');
      title.className = 'pub-card__title';
      title.textContent = pub.title;
      article.appendChild(title);

      const authors = document.createElement('p');
      authors.className = 'pub-card__authors';
      authors.textContent = pub.authors;
      article.appendChild(authors);

      const link = document.createElement('a');
      link.className = 'pub-card__link';
      link.href = pub.doi;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = pub.doi;
      article.appendChild(link);

      pubList.appendChild(article);
    });
  }

  renderPublications();

  const projectIntro = document.querySelector('#screen-projects .overlay');
  const projectCloseButton = document.getElementById('ppClose');
  let activeScreen = 'home';
  let suppressMapClose = false;

  function showProjectIntro() {
    if (projectIntro) {
      projectIntro.classList.remove('overlay--hidden');
    }
  }

  function hideProjectIntro() {
    if (projectIntro) {
      projectIntro.classList.add('overlay--hidden');
    }
  }

  function clearBoundaryLayer() {
    if (activeBoundaryLayer) {
      map.removeLayer(activeBoundaryLayer);
      activeBoundaryLayer = null;
    }
  }

  function waitForMapSettled() {
    return new Promise((resolve) => {
      let resolved = false;
      const complete = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      const timer = setTimeout(() => {
        map.off('moveend', handleMoveEnd);
        complete();
      }, SHEET_DELAY);
      function handleMoveEnd() {
        clearTimeout(timer);
        complete();
      }
      map.once('moveend', handleMoveEnd);
    });
  }

  async function loadBoundaryLayer(fileName) {
    if (!fileName) {
      return null;
    }
    if (boundaryCache.has(fileName)) {
      return boundaryCache.get(fileName);
    }
    try {
      const response = await fetch(`${BOUNDARY_BASE_PATH}${fileName}`);
      if (!response.ok) {
        boundaryCache.set(fileName, null);
        return null;
      }
      const data = await response.json();
      boundaryCache.set(fileName, data);
      return data;
    } catch (error) {
      boundaryCache.set(fileName, null);
      return null;
    }
  }

  async function focusProjectArea(project) {
    if (!project) {
      return;
    }

    const boundaryFile = PROJECT_BOUNDARIES[project.id];
    let bounds = null;

    if (boundaryFile) {
      const data = await loadBoundaryLayer(boundaryFile);
      if (data) {
        clearBoundaryLayer();
        activeBoundaryLayer = L.geoJSON(data, {
          style() {
            return {
              color: '#111827',
              weight: 2.4,
              opacity: 0.85,
              fillOpacity: 0
            };
          }
        });
        activeBoundaryLayer.addTo(map);
        bounds = activeBoundaryLayer.getBounds();
      }
    }

    if (!bounds) {
      clearBoundaryLayer();
    }

    if (bounds && bounds.isValid()) {
      const waitForMove = waitForMapSettled();
      map.flyToBounds(bounds, { padding: [60, 60], duration: FLY_DURATION, easeLinearity: 0.25 });
      await waitForMove;
    } else if (Array.isArray(project.coords)) {
      const waitForMove = waitForMapSettled();
      map.flyTo(project.coords, project.detailZoom || DETAIL_FALLBACK_ZOOM, {
        duration: FLY_DURATION,
        easeLinearity: 0.25
      });
      await waitForMove;
    }
  }

  function refreshProjectMarkers() {
    cluster.clearLayers();
    projects.forEach((project) => {
      const marker = L.marker(project.coords, {
        icon: pinIcons[project.role] || pinIcons.charge,
        title: project.title
      });
      marker.setZIndexOffset(project.role === 'chef' ? 200 : 0);
      marker.on('click', (evt) => {
        suppressMapClose = true;
        if (evt && evt.originalEvent) {
          evt.originalEvent.stopPropagation();
        }
        focusProjectArea(project)
          .catch(() => {})
          .then(() => {
            openProjectPanel(project);
            scheduleMapInvalidate(160);
          })
          .finally(() => {
            requestAnimationFrame(() => {
              suppressMapClose = false;
            });
          });
      });
      marker.bindPopup(createProjectPopup(project), { className: 'project-popup' });
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
    clearBoundaryLayer();
  }

  function clearArchitectureTimers() {
    clearTimeout(architectureRevealTimeout);
    architectureRevealTimeout = null;
    architecturePhotoTimers.forEach((timeoutId) => clearTimeout(timeoutId));
    architecturePhotoTimers = [];
  }

  function hideArchitectureDetail() {
    clearArchitectureTimers();
    if (archDetailElement) {
      archDetailElement.classList.remove('is-visible');
      archDetailElement.hidden = true;
    }
    if (archGallery) {
      archGallery.innerHTML = '';
    }
    scheduleMapInvalidate(160);
  }

  function showArchitectureIntro() {
    if (archIntroElement) {
      archIntroElement.hidden = false;
      archIntroElement.style.opacity = '1';
      archIntroElement.style.transform = 'translateY(0)';
    }
  }

  function hideArchitectureIntro() {
    if (archIntroElement) {
      archIntroElement.hidden = true;
    }
  }

  function populateArchitectureDetail(project) {
    if (!archDetailElement || !project) {
      return;
    }

    archTitle.textContent = project.title;
    archTeam.textContent = `${project.commune} · ${project.summary}`;
    archArchitects.textContent = (project.architects || []).join(', ') || '—';
    archCollaborators.textContent = (project.collaborators || []).join(', ') || '—';
    archEngineering.textContent = project.engineering || '—';
    archElectricity.textContent = project.electricity || '—';
    archWater.textContent = project.water || '—';

    if (archGallery) {
      archGallery.innerHTML = '';
      (project.photos || []).forEach((photo, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'arch-gallery__item';
        button.setAttribute('role', 'listitem');
        button.dataset.caption = photo.caption || '';
        button.setAttribute('aria-label', photo.caption || 'Voir la photo du projet');
        button.style.backgroundImage = `url('${photo.square}')`;
        button.addEventListener('click', () => {
          openLightbox(photo);
        });
        archGallery.appendChild(button);
        const timer = setTimeout(() => {
          button.classList.add('is-visible');
        }, 400 + index * 420);
        architecturePhotoTimers.push(timer);
      });
    }
  }

  function renderArchitectureDetail(project) {
    populateArchitectureDetail(project);
    if (archDetailElement) {
      archDetailElement.hidden = false;
      requestAnimationFrame(() => {
        archDetailElement.classList.add('is-visible');
        scheduleMapInvalidate(160);
      });
    }
  }

  function ensureArchitectureMarkers() {
    if (!map.hasLayer(architectureLayer)) {
      map.addLayer(architectureLayer);
    }
    if (architectureLayer.getLayers().length > 0) {
      return;
    }
    architectureProjects.forEach((project) => {
      const marker = L.marker(project.coords, {
        icon: pinIcons.architecture,
        title: project.title
      });
      marker.on('click', (evt) => {
        suppressMapClose = true;
        if (evt && evt.originalEvent) {
          evt.originalEvent.stopPropagation();
        }
        focusArchitectureProject(project);
        requestAnimationFrame(() => {
          suppressMapClose = false;
        });
      });
      architectureLayer.addLayer(marker);
    });
  }

  function removeArchitectureMarkers() {
    if (map.hasLayer(architectureLayer)) {
      map.removeLayer(architectureLayer);
    }
    hideArchitectureDetail();
  }

  function focusArchitectureProject(project) {
    if (!project) {
      return;
    }
    clearArchitectureTimers();
    hideArchitectureDetail();

    const zoom = project.zoom || 13;
    const waitForMove = waitForMapSettled();
    map.flyTo(project.coords, zoom, { duration: FLY_DURATION, easeLinearity: 0.25 });

    waitForMove.then(() => {
      architectureRevealTimeout = setTimeout(() => {
        renderArchitectureDetail(project);
      }, SHEET_DELAY);
    });
  }

  function openLightbox(photo) {
    if (!lightboxElement || !lightboxImage || !photo) {
      return;
    }
    lightboxImage.src = photo.portrait || photo.square || '';
    lightboxImage.alt = photo.caption || '';
    if (lightboxCaption) {
      lightboxCaption.textContent = photo.caption || '';
    }
    lightboxElement.hidden = false;
    requestAnimationFrame(() => {
      lightboxElement.classList.add('is-visible');
      if (lightboxClose) {
        lightboxClose.focus();
      }
    });
  }

  function closeLightbox() {
    if (!lightboxElement) {
      return;
    }
    lightboxElement.classList.remove('is-visible');
    setTimeout(() => {
      lightboxElement.hidden = true;
      if (lightboxImage) {
        lightboxImage.src = '';
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = '';
      }
    }, 200);
  }

  const sections = Array.from(document.querySelectorAll('[data-screen]')).reduce((acc, section) => {
    acc[section.dataset.screen] = section;
    return acc;
  }, {});

  const navToggle = document.getElementById('navToggle');
  const navScrim = document.getElementById('navScrim');
  const pageBody = document.body;
  let navIsOpen = false;

  function setNavState(open) {
    if (!pageBody) {
      return;
    }
    navIsOpen = open;
    pageBody.classList.toggle('nav-open', open);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Fermer le menu Accueil' : 'Ouvrir le menu Accueil');
    }
    if (navScrim) {
      navScrim.hidden = !open;
    }
    scheduleMapInvalidate(150);
  }

  function closeNav() {
    if (navIsOpen) {
      setNavState(false);
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      setNavState(!navIsOpen);
    });
  }

  if (navScrim) {
    navScrim.addEventListener('click', closeNav);
  }

  const desktopQuery = window.matchMedia('(min-width: 768px)');
  if (desktopQuery && typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', (event) => {
      if (event.matches) {
        closeNav();
      }
    });
  } else if (desktopQuery && typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener((event) => {
      if (event.matches) {
        closeNav();
      }
    });
  }

  const NAV_ITEMS = [
    { id: 'home', label: 'Accueil', screen: 'home', icon: 'home' },
    { id: 'projects', label: 'Études en France', screen: 'projects' },
    { id: 'publications', label: 'Publications', screen: 'publications' },
    { id: 'architecture', label: 'Architecture', screen: 'architecture' },
    { id: 'contact', label: 'Contact', screen: 'contact' }
  ];

  const navContainer = document.querySelector('.nav');
  NAV_ITEMS.forEach((item) => {
    if (item.href) {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      link.rel = 'noopener';
      link.className = 'nav__link';
      link.addEventListener('click', () => {
        closeNav();
      });
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

    button.addEventListener('click', () => {
      activateScreen(item.screen);
      closeNav();
    });
    navContainer.appendChild(button);
  });

  function activateScreen(id) {
    closeNav();
    Object.entries(sections).forEach(([key, section]) => {
      if (!section) return;
      section.hidden = key !== id;
    });

    Array.from(navContainer.querySelectorAll('button')).forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.screenTarget === id);
    });

    activeScreen = id;

    if (id === 'publications') {
      setWheelMode('hover');
    } else if (id === 'architecture') {
      setWheelMode('enabled');
    } else {
      setWheelMode('disabled');
    }

    if (id === 'projects') {
      toProjects();
    } else if (id === 'publications') {
      toPublications();
    } else if (id === 'home') {
      toHome();
    } else if (id === 'architecture') {
      toArchitecture();
    } else if (id === 'contact') {
      toContact();
    }

    if (id !== 'projects') {
      hideProjectIntro();
    }
    if (id !== 'architecture') {
      hideArchitectureDetail();
    }
    scheduleMapInvalidate(200);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (navIsOpen) {
        event.preventDefault();
        closeNav();
        return;
      }
      if (lightboxElement && !lightboxElement.hidden) {
        event.preventDefault();
        closeLightbox();
        return;
      }
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
  const panelRole = document.getElementById('ppRole');
  const panelType = document.getElementById('ppType');
  const panelSkills = document.getElementById('ppSkills');
  const panelDescription = document.getElementById('ppDesc');
  const archDetailElement = document.getElementById('archDetail');
  const archIntroElement = document.getElementById('archIntro');
  const archTitle = document.getElementById('archDetailTitle');
  const archTeam = document.getElementById('archDetailTeam');
  const archArchitects = document.getElementById('archDetailArchitects');
  const archCollaborators = document.getElementById('archDetailCollaborators');
  const archEngineering = document.getElementById('archDetailEngineering');
  const archElectricity = document.getElementById('archDetailElectricity');
  const archWater = document.getElementById('archDetailWater');
  const archGallery = document.getElementById('archGallery');
  const contactZoomButton = document.getElementById('contactZoom');
  if (contactZoomButton) {
    contactZoomButton.addEventListener('click', () => {
      map.flyTo(CONTACT_CENTER, CONTACT_ZOOM, { duration: FLY_DURATION, easeLinearity: 0.25 });
      scheduleMapInvalidate(220);
    });
  }
  const lightboxElement = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  function openProjectPanel(project) {
    panelTitle.textContent = project.title;
    panelClient.textContent = project.client || '—';
    panelPartner.textContent = project.partner || '—';
    panelDate.textContent = project.year || '—';
    panelRole.textContent = formatRole(project.role);
    panelType.textContent = project.type || '—';
    panelDescription.textContent = project.description || '';
    if (panelSkills) {
      panelSkills.innerHTML = '';
      (project.skills || []).forEach((skill) => {
        const li = document.createElement('li');
        li.textContent = skill;
        panelSkills.appendChild(li);
      });
    }
    panelElement.scrollTop = 0;
    panelElement.hidden = false;
    hideProjectIntro();
    scheduleMapInvalidate(160);
  }

  function closeProjectPanel({ resetIntro = true } = {}) {
    if (!panelElement) {
      return;
    }
    panelElement.hidden = true;
    if (resetIntro && activeScreen === 'projects') {
      showProjectIntro();
    }
    map.closePopup();
    scheduleMapInvalidate(160);
  }

  if (projectCloseButton) {
    projectCloseButton.addEventListener('click', () => closeProjectPanel());
  }

  const photoCard = document.getElementById('stamp');
  const heroBox = document.getElementById('heroBox');

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxElement) {
    lightboxElement.addEventListener('click', (event) => {
      if (event.target === lightboxElement) {
        closeLightbox();
      }
    });
  }
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
    removeArchitectureMarkers();
    closeProjectPanel({ resetIntro: false });
    hideProjectIntro();
    hideArchitectureDetail();
    hideArchitectureIntro();
    closeLightbox();
    startPhotoCard();
  }

  function toProjects() {
    map.flyTo(PROJECT_CENTER, PROJECT_ZOOM, { duration: 2, easeLinearity: 0.2 });
    refreshProjectMarkers();
    removeArchitectureMarkers();
    closeProjectPanel();
    showProjectIntro();
    hideArchitectureDetail();
    hideArchitectureIntro();
    closeLightbox();
    stopPhotoCard();
  }

  function toPublications() {
    removeProjectMarkers();
    removeArchitectureMarkers();
    closeProjectPanel({ resetIntro: false });
    hideProjectIntro();
    hideArchitectureDetail();
    hideArchitectureIntro();
    closeLightbox();
    stopPhotoCard();
    if (pubList) {
      pubList.scrollTop = 0;
    }
    map.flyTo(PUBLICATION_CENTER, PUBLICATION_ZOOM, { duration: 2.2, easeLinearity: 0.2 });
  }

  function toArchitecture() {
    removeProjectMarkers();
    closeProjectPanel({ resetIntro: false });
    hideProjectIntro();
    stopPhotoCard();
    closeLightbox();
    showArchitectureIntro();
    hideArchitectureDetail();
    ensureArchitectureMarkers();
    map.flyTo(ARCHITECTURE_CENTER, ARCHITECTURE_ZOOM, { duration: 2.2, easeLinearity: 0.22 });
  }

  function toContact() {
    removeProjectMarkers();
    removeArchitectureMarkers();
    closeProjectPanel({ resetIntro: false });
    hideProjectIntro();
    hideArchitectureDetail();
    hideArchitectureIntro();
    closeLightbox();
    stopPhotoCard();
    map.flyTo(CONTACT_CENTER, CONTACT_ZOOM, { duration: FLY_DURATION, easeLinearity: 0.3 });
  }

  map.on('click', () => {
    if (suppressMapClose) {
      return;
    }
    if (activeScreen === 'projects' && panelElement && !panelElement.hidden) {
      closeProjectPanel();
    }
    if (activeScreen === 'architecture' && archDetailElement && !archDetailElement.hidden) {
      hideArchitectureDetail();
    }
  });

  cluster.on('clusterclick', (evt) => {
    suppressMapClose = true;
    if (evt && evt.originalEvent) {
      evt.originalEvent.stopPropagation();
    }
    requestAnimationFrame(() => {
      suppressMapClose = false;
    });
  });

  function init() {
    hydrateThemeAssets();
    map.setView(HOME_CENTER, HOME_ZOOM);
    hideArchitectureIntro();
    activateScreen('home');
  }

  init();

  console.assert(typeof L !== 'undefined', 'Leaflet should be available');
  console.assert(Array.isArray(projects) && projects.length > 0, 'Project list should not be empty');
})();
