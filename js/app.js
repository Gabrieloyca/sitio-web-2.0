/* global L */
(function () {
  'use strict';

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
  const PUBLICATION_CENTER = [23, 4];
  const PUBLICATION_ZOOM = 3;

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

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 44,
    iconCreateFunction(clusterGroup) {
      const count = clusterGroup.getChildCount();
      let sizeClass = 'cluster--small';
      if (count >= 10 && count < 20) {
        sizeClass = 'cluster--medium';
      } else if (count >= 20) {
        sizeClass = 'cluster--large';
      }

      return L.divIcon({
        html: `<span>${count}</span>`,
        className: `cluster ${sizeClass}`,
        iconSize: [46, 46],
        iconAnchor: [23, 23]
      });
    }
  });

  function buildPinSvg(role) {
    if (role === 'chef') {
      return `
        <svg viewBox="0 0 40 54" xmlns="http://www.w3.org/2000/svg" role="presentation">
          <defs>
            <radialGradient id="chefGlow" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#111827" stop-opacity="0" />
            </radialGradient>
          </defs>
          <path fill="#0b1120" d="M20 53c-3.6-4.1-18-19.3-18-33.2C2 8.89 9.61 1 20 1s18 7.89 18 18.8C38 33.7 23.6 48.9 20 53z" />
          <path fill="#111827" d="M20 48.2c-3.1-3.6-15.6-17-15.6-28.4C4.4 9.96 11.32 4 20 4s15.6 5.96 15.6 15.8C35.6 31.2 23.1 44.6 20 48.2z" />
          <circle cx="20" cy="19.6" r="7.6" fill="#1f2937" />
          <circle cx="20" cy="19.6" r="4.8" fill="#f3f4f6" opacity="0.18" />
          <ellipse cx="20" cy="46" rx="6.5" ry="2.2" fill="url(#chefGlow)" />
        </svg>
      `.trim();
    }

    return `
      <svg viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg" role="presentation">
        <path fill="#64748b" d="M17 45c-3-3.5-15-16.3-15-27.6C2 8.66 8.82 2 17 2s15 6.66 15 15.4C32 28.7 20 41.5 17 45z" />
        <path fill="#94a3b8" d="M17 40.8c-2.6-3-12.2-13.8-12.2-22.8C4.8 10.37 10.1 6 17 6s12.2 4.37 12.2 12c0 9-9.6 19.8-12.2 22.8z" />
        <circle cx="17" cy="18" r="6.2" fill="#e2e8f0" opacity="0.75" />
      </svg>
    `.trim();
  }

  function svgToDataUrl(svgMarkup) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`;
  }

  function createPinIcon(role) {
    const isChef = role === 'chef';
    const size = isChef ? [40, 54] : [34, 46];
    const svgMarkup = buildPinSvg(role);
    return L.icon({
      className: `project-pin project-pin--${role}`,
      iconUrl: svgToDataUrl(svgMarkup),
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1]],
      popupAnchor: [0, -size[1] + 16]
    });
  }

  const pinIcons = {
    chef: createPinIcon('chef'),
    charge: createPinIcon('charge')
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
        openProjectPanel(project);
        requestAnimationFrame(() => {
          suppressMapClose = false;
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
  }

  const sections = Array.from(document.querySelectorAll('[data-screen]')).reduce((acc, section) => {
    acc[section.dataset.screen] = section;
    return acc;
  }, {});

  const NAV_ITEMS = [
    { id: 'home', label: 'Accueil', screen: 'home', icon: 'home' },
    { id: 'projects', label: 'Études en France', screen: 'projects' },
    { id: 'publications', label: 'Publications', screen: 'publications' },
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

    activeScreen = id;

    if (id === 'projects') {
      toProjects();
    } else if (id === 'publications') {
      toPublications();
    } else if (id === 'home') {
      toHome();
    }

    if (id !== 'projects') {
      hideProjectIntro();
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
  const panelRole = document.getElementById('ppRole');
  const panelType = document.getElementById('ppType');
  const panelSkills = document.getElementById('ppSkills');
  const panelDescription = document.getElementById('ppDesc');

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
  }

  if (projectCloseButton) {
    projectCloseButton.addEventListener('click', () => closeProjectPanel());
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
    closeProjectPanel({ resetIntro: false });
    hideProjectIntro();
    startPhotoCard();
  }

  function toProjects() {
    map.flyTo(PROJECT_CENTER, PROJECT_ZOOM, { duration: 2, easeLinearity: 0.2 });
    refreshProjectMarkers();
    closeProjectPanel();
    showProjectIntro();
    stopPhotoCard();
  }

  function toPublications() {
    removeProjectMarkers();
    closeProjectPanel({ resetIntro: false });
    hideProjectIntro();
    stopPhotoCard();
    if (pubList) {
      pubList.scrollTop = 0;
    }
    map.flyTo(PUBLICATION_CENTER, PUBLICATION_ZOOM, { duration: 2.2, easeLinearity: 0.2 });
  }

  map.on('click', () => {
    if (activeScreen !== 'projects' || panelElement.hidden || suppressMapClose) {
      return;
    }
    closeProjectPanel();
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
    activateScreen('home');
  }

  init();

  console.assert(typeof L !== 'undefined', 'Leaflet should be available');
  console.assert(Array.isArray(projects) && projects.length > 0, 'Project list should not be empty');
})();
