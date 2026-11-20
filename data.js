// Helpers to build Google Maps links
const mapsSearch = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const mapsRoute = (stops, mode = "driving") => {
  const params = [`origin=${encodeURIComponent(stops[0])}`, `destination=${encodeURIComponent(stops[stops.length - 1])}`, `travelmode=${mode}`];
  if (stops.length > 2) params.push(`waypoints=${encodeURIComponent(stops.slice(1, -1).join("|"))}`);
  return `https://www.google.com/maps/dir/?api=1&${params.join("&")}`;
};
const mapsEmbed = (stops, mode = "driving") => {
  const daddr = stops.slice(1).map(encodeURIComponent).join("+to:");
  return `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(stops[0])}&daddr=${daddr}${mode === "walking" ? "&dirflg=w" : ""}`;
};
const placeLink = (text, query) => `<a href='${mapsSearch(query)}' target='_blank' rel='noopener noreferrer' class='inline-link'>${text} ↗</a>`;
const webLink = (text, url) => `<a href='${url}' target='_blank' rel='noopener noreferrer' class='inline-link'>${text} ↗</a>`;

const HOME_ADDRESS = "Zamakola Kalea 17, Bilbao";
const NEARBY_LANDMARK_URL = "https://share.google/K5C6Y81O3kxkZpI5T";

const TRIP_DATA = window.TRIP_DATA = {
  tripInfo: {
    title: "Puente de diciembre en Euskadi",
    subtitle: "Bilbao — Zumaia — Donostia — Gaztelugatxe — Vitoria-Gasteiz",
    dates: "Del viernes 4 al martes 8 de diciembre de 2026 · 5 días · 4 noches",
    departure: "2026-12-04T15:00:00+01:00"
  },
  days: [
    {
      dayNum: 1,
      shortDate: "Vie 4",
      weatherDestinationIds: ["santiago", "llanes", "bilbao"],
      title: "Día 1 — Viaje de ida a Bilbao",
      date: "VIERNES, 4 DE DICIEMBRE DE 2026",
      subHeader: "Santiago → Bilbao por la A-8",
      image: "assets/images/bilbao_ria.jpg",
      imageCredit: "Foto: Zarateman · CC0 · Wikimedia Commons",
      accommodation: {
        name: "Apartamento en Zamakola",
        address: HOME_ADDRESS,
        details: "Con garaje · 7 minutos a pie del Casco Viejo · llegada prevista sobre las 22:00"
      },
      summary: "Salida por la tarde desde casa por la A-8 (Cantábrico), con parada para cenar en Asturias, a mitad de camino largo, y llegada al alojamiento de Bilbao para dejar el coche en el garaje y dormir.",
      goal: "Llegar a Bilbao sin prisas y descansar, porque el sábado se sale temprano hacia la costa.",
      travelTimes: [
        { from: "Santiago de Compostela", to: HOME_ADDRESS, desc: "≈ 640 km · 6 h 30 min – 7 h con parada", mapsUrl: mapsRoute(["Santiago de Compostela", "Llanes", HOME_ADDRESS]), icon: "🚗" }
      ],
      mapEmbed: mapsEmbed(["Santiago de Compostela", "Llanes", HOME_ADDRESS]),
      mapLink: mapsRoute(["Santiago de Compostela", "Llanes", HOME_ADDRESS]),
      schedule: [
        { time: "15:00", desc: "🚗 Salida desde casa por la A-8 (Cantábrico)." },
        { time: "~19:00", desc: "🍽️ Parada para cenar en Asturias, en la zona de Llanes o Ribadesella." },
        { time: "~22:00", desc: "🏠 Llegada a Zamakola Kalea 17, al lado de " + webLink("Obar Catracho", NEARBY_LANDMARK_URL) + ". Coche al garaje y a dormir." }
      ],
      tips: [
        "El viernes por la tarde es día de mucha salida de puente: contad con 30 – 60 min más y mirad el tráfico (DGT o Google Maps) antes de salir.",
        "Si podéis salir antes de las 14:00, mejor.",
        "Avisad a Andoni de que llegaréis sobre las 22:00."
      ]
    },
    {
      dayNum: 2,
      shortDate: "Sáb 5",
      weatherDestinationIds: ["zumaia", "donostia"],
      title: "Día 2 — Flysch de Zumaia y Donostia",
      date: "SÁBADO, 5 DE DICIEMBRE DE 2026",
      subHeader: "Bilbao → Zumaia → Donostia → Bilbao",
      image: "assets/images/zumaia_flysch.jpg",
      imageCredit: "Foto: Simoncio · CC BY-SA 4.0 · Wikimedia Commons",
      accommodation: {
        name: "Apartamento en Zamakola",
        address: HOME_ADDRESS,
        details: "Regreso previsto sobre las 21:15"
      },
      summary: "La excursión a la costa pasa al sábado para que el domingo estéis en Bilbao para el partido. Salida temprana para llegar con luz y marea de mañana. Por la mañana, el flysch de Zumaia, en el Geoparque de la Costa Vasca. Desde mediodía, Donostia: pintxos en la Parte Vieja, paseo por la Concha y atardecer sobre la bahía.",
      goal: "Ver el flysch con buena luz y disfrutar de Donostia a pie, sin preocuparse del coche.",
      nature: {
        geology: "El flysch de Zumaia es una sucesión de estratos marinos que se alternan en capas duras y blandas. En sus acantilados se reconoce el límite entre el Cretácico y el Paleógeno, el de la gran extinción de hace unos 66 millones de años."
      },
      travelTimes: [
        { from: HOME_ADDRESS, to: "Playa de Itzurun, Zumaia", desc: "≈ 74 km · 1 h por la AP-8 (peaje)", mapsUrl: mapsRoute([HOME_ADDRESS, "Playa de Itzurun, Zumaia"]), icon: "🚗" },
        { from: "Playa de Itzurun, Zumaia", to: "Parking Boulevard, Donostia", desc: "≈ 35 km · 35 min", mapsUrl: mapsRoute(["Playa de Itzurun, Zumaia", "Parking Boulevard, San Sebastián"]), icon: "🚗" },
        { from: "Parking Boulevard, Donostia", to: HOME_ADDRESS, desc: "≈ 98 km · 1 h 15 min", mapsUrl: mapsRoute(["Parking Boulevard, San Sebastián", HOME_ADDRESS]), icon: "🚗" }
      ],
      mapEmbed: mapsEmbed([HOME_ADDRESS, "Playa de Itzurun, Zumaia", "Parking Boulevard, San Sebastián", HOME_ADDRESS]),
      mapLink: mapsRoute([HOME_ADDRESS, "Playa de Itzurun, Zumaia", "Parking Boulevard, San Sebastián", HOME_ADDRESS]),
      itinerary: [
        {
          section: "Mañana · Flysch de Zumaia",
          items: [
            { name: "Ermita de San Telmo", mapsUrl: mapsSearch("Ermita de San Telmo, Zumaia"), desc: "Aparcad junto a la playa de Itzurun y subid a la ermita: la vista clásica de los estratos." },
            { name: "Sendero a la punta de Algorri", mapsUrl: mapsSearch("Punta de Algorri, Zumaia"), desc: "~1 h 30 ida y vuelta, fácil. Si la marea está baja, bajad a la playa a ver la rasa mareal al completo." },
            { name: "Barco «Flysch esencial»", mapsUrl: mapsSearch("Algorri Centro de Interpretación, Zumaia"), desc: "1 h, enseña el flysch desde el agua. En invierno depende del tiempo y del mar: preguntad en la oficina de turismo de Zumaia (943 143 396) o en el Centro Algorri." },
            { name: "Getaria (opcional)", mapsUrl: mapsSearch("Getaria"), desc: "A 15 min. Pueblo pesquero precioso con el monte Ratón al lado." }
          ]
        },
        {
          section: "Tarde · Donostia",
          items: [
            { name: "Paseo de la Concha hasta el Peine del Viento", image: "assets/images/donostia_concha.jpg", imageCredit: "Foto: Ermell · CC BY-SA 4.0 · Wikimedia Commons", mapsUrl: mapsSearch("Peine del Viento, San Sebastián"), desc: "Paseo por la bahía de la Concha hasta las esculturas de Chillida, al final de la playa de Ondarreta." },
            { name: "Monte Urgull o Monte Igeldo", mapsUrl: mapsSearch("Monte Igeldo, San Sebastián"), desc: "Subid al monte Urgull (gratis, a pie) o en el funicular de Igeldo para ver la bahía al atardecer. El horario de invierno del funicular no está confirmado: comprobadlo en " + webLink("monteigueldo.es", "https://www.monteigueldo.es") + " antes de subir." },
            { name: "Último pintxo en Gros", mapsUrl: mapsSearch("Barrio de Gros, San Sebastián"), desc: "Labrit Berri o La Rebotika, con opciones vegetarianas, antes de volver a por el coche." }
          ]
        }
      ],
      cityGuide: {
        intro: "Reservad la comida del sábado: es puente y se llena.",
        eating: "<p><strong>Pintxos en la Parte Vieja</strong> con opciones vegetarianas: " + placeLink("Bar Ganbara", "Bar Ganbara, San Jerónimo 21, San Sebastián") + ", " + placeLink("La Cepa de Bernardo", "La Cepa de Bernardo, San Sebastián") + " y " + placeLink("Bar Aukera", "Bar Aukera, San Sebastián") + " (vegetarianas y veganas).</p><p><strong>Alternativa:</strong> " + placeLink("El Mapa Verde", "Mapa Verde, Trueba 4, San Sebastián") + ", 100 % vegano, junto a Tabakalera (confirmad que abre en sábado).</p>",
        planB: "<p><strong>Si llueve:</strong> el " + placeLink("Museo San Telmo", "San Telmo Museoa, San Sebastián") + ", en la Parte Vieja, abre el sábado (el lunes cierra).</p>"
      },
      schedule: [
        { time: "08:45", desc: "🚗 Salida hacia Zumaia (~1 h por la AP-8, de peaje)." },
        { time: "~09:45", desc: "🪨 Flysch de Zumaia: ermita de San Telmo y sendero de Algorri." },
        { time: "13:00", desc: "🚗 A Donostia (35 min). Aparcad en un parking subterráneo del centro (Boulevard u Okendo) y olvidaos del coche." },
        { time: "~13:35", desc: "🍢 Comida: pintxos en la Parte Vieja." },
        { time: "Tarde", desc: "🌊 Paseo por la Concha hasta el Peine del Viento, y subida a Urgull o Igeldo al atardecer. Último pintxo en Gros." },
        { time: "~20:00", desc: "🚗 Vuelta a Bilbao (1 h 15). Llegada sobre las 21:15." }
      ],
      tips: [
        "Mirad la tabla de mareas del sábado 5: con marea baja se ve la rasa mareal del flysch al completo.",
        "El flysch resbala: llevad calzado que agarre.",
        "En Donostia, id directos a un parking subterráneo: aparcar en superficie es caro."
      ]
    },
    {
      dayNum: 3,
      shortDate: "Dom 6",
      weatherDestinationIds: ["bilbao"],
      title: "Día 3 — Bilbao a pie y partido",
      date: "DOMINGO, 6 DE DICIEMBRE DE 2026",
      subHeader: "Guggenheim · Ría · Casco Viejo · San Mamés · Artxanda",
      image: "assets/images/bilbao_guggenheim.jpg",
      imageCredit: "Foto: Jules Verne Times Two · CC BY-SA 4.0 · Wikimedia Commons",
      accommodation: {
        name: "Apartamento en Zamakola",
        address: HOME_ADDRESS,
        details: "El coche se queda en el garaje todo el día"
      },
      summary: "Día en Bilbao sin coche. Por la mañana, el Guggenheim los cuatro juntos y paseo por la ría hasta el Casco Viejo. Por la tarde, quien va al partido coge el metro a San Mamés (Athletic – Real Madrid, 16:15) y los otros tres suben en el funicular de Artxanda al anochecer. Por la noche, pintxos todos juntos.",
      goal: "Conocer Bilbao a pie y llegar al partido en metro, sin depender del coche.",
      travelTimes: [
        { from: HOME_ADDRESS, to: "Museo Guggenheim Bilbao", desc: "A pie (ruta en el mapa)", mapsUrl: mapsRoute([HOME_ADDRESS, "Museo Guggenheim Bilbao"], "walking"), icon: "🚶" },
        { from: "Museo Guggenheim Bilbao", to: "Casco Viejo, Bilbao", desc: "≈ 2 km · 25 min a pie por la ría", mapsUrl: mapsRoute(["Museo Guggenheim Bilbao", "Plaza Nueva, Bilbao"], "walking"), icon: "🚶" },
        { from: "Metro Casco Viejo (Zazpikaleak)", to: "San Mamés", desc: "~10 min en metro (líneas 1 y 2) · salida 15:15, solo quien va al partido", mapsUrl: mapsRoute(["Zazpikaleak/Casco Viejo, Bilbao", "Estadio San Mamés, Bilbao"], "transit"), icon: "🚇" },
        { from: "Casco Viejo, Bilbao", to: "Funicular de Artxanda", desc: "A pie, cruzando la ría · los otros tres", mapsUrl: mapsRoute(["Plaza Nueva, Bilbao", "Funicular de Artxanda, Bilbao"], "walking"), icon: "🚶" },
        { from: "Funicular de Artxanda", to: "Mirador de Artxanda", desc: "3 min en funicular", mapsUrl: mapsSearch("Mirador de Artxanda, Bilbao"), icon: "🚡" }
      ],
      mapEmbed: mapsEmbed([HOME_ADDRESS, "Museo Guggenheim Bilbao", "Plaza Nueva, Bilbao", "Funicular de Artxanda, Bilbao"], "walking"),
      mapLink: mapsRoute([HOME_ADDRESS, "Museo Guggenheim Bilbao", "Plaza Nueva, Bilbao", "Funicular de Artxanda, Bilbao"], "walking"),
      itinerary: [
        {
          section: "Mañana · Guggenheim y ría",
          items: [
            { name: "Museo Guggenheim Bilbao", image: "assets/images/bilbao_guggenheim.jpg", imageCredit: "Foto: Jules Verne Times Two · CC BY-SA 4.0 · Wikimedia Commons", mapsUrl: mapsSearch("Museo Guggenheim Bilbao"), desc: "A las 10:00, los cuatro juntos. El edificio por fuera (Puppy, Mamá, el puente de La Salve) y las exposiciones por dentro. Calculad 2 h. Abre de 10:00 a 19:00 y cierra los lunes. Entradas online en " + webLink("guggenheim-bilbao.eus", "https://www.guggenheim-bilbao.eus") + "." },
            { name: "Paseo por la ría", mapsUrl: mapsSearch("Paseo de Uribitarte, Bilbao"), desc: "Sobre las 12:00, hacia el Casco Viejo: Abandoibarra, Uribitarte, puente Zubizuri y Arenal." }
          ]
        },
        {
          section: "Mediodía · Casco Viejo",
          items: [
            { name: "Las Siete Calles", mapsUrl: mapsSearch("Siete Calles, Casco Viejo, Bilbao"), desc: "El núcleo medieval de la ciudad, a 7 minutos del alojamiento." },
            { name: "Catedral de Santiago", mapsUrl: mapsSearch("Catedral de Santiago, Bilbao"), desc: "En pleno Casco Viejo, junto a Belostikale." },
            { name: "Plaza Nueva", mapsUrl: mapsSearch("Plaza Nueva, Bilbao"), desc: "Plaza porticada del Casco Viejo. Volveréis por la noche a por pintxos." },
            { name: "Mercado de la Ribera", mapsUrl: mapsSearch("Mercado de la Ribera, Bilbao"), desc: "El mercado cubierto más grande de Europa. Merece verse por fuera, pero el domingo los puestos de abastos están cerrados (solo abre la zona de bares)." }
          ]
        },
        {
          section: "Tarde · Partido y Artxanda",
          items: [
            { name: "Athletic – Real Madrid en San Mamés", mapsUrl: mapsSearch("Estadio San Mamés, Bilbao"), desc: "Para quien va al partido: metro a las 15:15 desde el Casco Viejo (~10 min, líneas 1 y 2). Empieza a las 16:15 y termina hacia las 18:15. No uséis el coche: la zona se colapsa antes y después." },
            { name: "Café Obrador Okapi", mapsUrl: mapsSearch("Café Obrador Okapi, Belostikale 26, Bilbao"), desc: "Para los otros tres: café y algo dulce en Belostikale 26, junto a la catedral. Confirmad el horario de domingo." },
            { name: "Funicular de Artxanda", mapsUrl: mapsSearch("Funicular de Artxanda, Bilbao"), desc: "Sobre las 17:15, para ver Bilbao al anochecer (el sol se pone sobre las 17:35). Precio orientativo: 3,50 € el trayecto o 6 € ida y vuelta." }
          ]
        }
      ],
      cityGuide: {
        intro: "Reservad la cena del domingo: es puente y se llena. Confirmad que los sitios abren en domingo.",
        eating: "<p><strong>Comida (13:30) en el Casco Viejo:</strong> " + placeLink("Sustraiak", "Sustraiak, Bilbao") + " (menú vegetariano) o " + placeLink("Bohemian Lane", "Bohemian Lane, Carnicería Vieja 3, Bilbao") + " (vegano). Confirmad que abren en domingo.</p><p><strong>Noche (~18:30), los cuatro juntos:</strong> pintxos por la Plaza Nueva y la calle Ledesma, o cena tranquila en " + placeLink("Garibolo", "Garibolo, Fernández del Campo 7, Bilbao") + " (vegetariano, cerca del alojamiento).</p><p>⚠️ Sustraiak aparece en los directorios como catering vegetariano: comprobad que da comidas en sala el domingo.</p>",
        planB: "<p><strong>Si llueve mucho:</strong> el " + placeLink("Museo de Bellas Artes", "Museo de Bellas Artes de Bilbao") + ", a 5 minutos del Guggenheim, reabrió por completo en octubre tras la ampliación. Ya no es gratuito; mirad el horario de domingo en " + webLink("museobilbao.com", "https://www.museobilbao.com") + ".</p>"
      },
      schedule: [
        { time: "10:00", desc: "🎨 Museo Guggenheim, los cuatro juntos. Calculad 2 h.", isFixed: true, fixedLabel: "🎟️ ENTRADAS 10:00" },
        { time: "~12:00", desc: "🚶 Paseo por la ría hacia el Casco Viejo: Abandoibarra, Uribitarte, Zubizuri y Arenal." },
        { time: "Mediodía", desc: "🏛️ Casco Viejo: Siete Calles, Catedral de Santiago y Plaza Nueva. Mercado de la Ribera por fuera." },
        { time: "13:30", desc: "🌱 Comida vegetariana en el Casco Viejo: Sustraiak o Bohemian Lane." },
        { time: "15:15", desc: "🚇 Quien va al partido coge el metro a San Mamés (~10 min)." },
        { time: "16:15", desc: "⚽ Athletic – Real Madrid en San Mamés. Termina hacia las 18:15.", isFixed: true, fixedLabel: "⚽ PARTIDO" },
        { time: "Tarde", desc: "☕ Los otros tres: café y algo dulce en Okapi." },
        { time: "~17:15", desc: "🚡 Funicular de Artxanda para ver Bilbao al anochecer." },
        { time: "~18:30", desc: "🍢 Os juntáis los cuatro: pintxos por la Plaza Nueva y la calle Ledesma, o cena en Garibolo." }
      ],
      tips: [
        "No uséis el coche: la zona de San Mamés se colapsa antes y después del partido. Las líneas 1 y 2 del metro paran en San Mamés.",
        "Comprad las entradas del Guggenheim online para el domingo 6 a las 10:00.",
        "Reservad la cena del domingo: es puente y se llena.",
        "Anochece sobre las 17:35: no retraséis el funicular."
      ]
    },
    {
      dayNum: 4,
      shortDate: "Lun 7",
      weatherDestinationIds: ["gaztelugatxe", "vitoria", "nervion"],
      title: "Día 4 — Gaztelugatxe y Vitoria-Gasteiz",
      date: "LUNES, 7 DE DICIEMBRE DE 2026",
      subHeader: "Bilbao → Gaztelugatxe → Bermeo → Vitoria → Bilbao",
      image: "assets/images/gaztelugatxe.jpg",
      imageCredit: "Foto: Diego Delso · CC BY-SA 4.0 · Wikimedia Commons",
      accommodation: {
        name: "Apartamento en Zamakola",
        address: HOME_ADDRESS,
        details: "Última noche · regreso previsto sobre las 20:25"
      },
      summary: "Mañana en San Juan de Gaztelugatxe, con reserva a las 10:30, y café en el puerto pesquero de Bermeo. Tarde en Vitoria-Gasteiz: la Almendra medieval, la Catedral de Santa María y las luces de Navidad al anochecer.",
      goal: "Aprovechar la mañana con luz en la costa y terminar el viaje con el ambiente navideño de Vitoria. Si hay temporal, cambiad la costa por el Salto del Nervión.",
      nature: {
        fauna: "En los cortados del Salto del Nervión (Plan B) son habituales los buitres leonados.",
        geology: "Gaztelugatxe es un islote rocoso modelado por el oleaje, con arcos y túneles naturales, unido a tierra por un puente de piedra. El Salto del Nervión es la cascada más alta de la Península, con más de 200 m de caída."
      },
      travelTimes: [
        { from: HOME_ADDRESS, to: "San Juan de Gaztelugatxe", desc: "≈ 34 km · 45 min", mapsUrl: mapsRoute([HOME_ADDRESS, "San Juan de Gaztelugatxe"]), icon: "🚗" },
        { from: "San Juan de Gaztelugatxe", to: "Bermeo", desc: "≈ 9 km · 10 min", mapsUrl: mapsRoute(["San Juan de Gaztelugatxe", "Puerto de Bermeo"]), icon: "🚗" },
        { from: "Bermeo", to: "Casco Medieval, Vitoria-Gasteiz", desc: "≈ 99 km · 1 h 10 min", mapsUrl: mapsRoute(["Puerto de Bermeo", "Plaza de la Virgen Blanca, Vitoria-Gasteiz"]), icon: "🚗" },
        { from: "Casco Medieval, Vitoria-Gasteiz", to: HOME_ADDRESS, desc: "≈ 65 km · 55 min", mapsUrl: mapsRoute(["Plaza de la Virgen Blanca, Vitoria-Gasteiz", HOME_ADDRESS]), icon: "🚗" }
      ],
      travelTimes2Label: "☔ Plan B si hay temporal: Salto del Nervión",
      travelTimes2: [
        { from: HOME_ADDRESS, to: "Mirador del Salto del Nervión", desc: "≈ 48 km · 50 min (salida 09:30)", mapsUrl: mapsRoute([HOME_ADDRESS, "Mirador del Salto del Nervión"]), icon: "🚗" },
        { from: "Mirador del Salto del Nervión", to: "Vitoria-Gasteiz", desc: "≈ 48 km · 50 min (salida sobre las 12:15)", mapsUrl: mapsRoute(["Mirador del Salto del Nervión", "Plaza de la Virgen Blanca, Vitoria-Gasteiz"]), icon: "🚗" }
      ],
      mapEmbed: mapsEmbed([HOME_ADDRESS, "San Juan de Gaztelugatxe", "Puerto de Bermeo", "Plaza de la Virgen Blanca, Vitoria-Gasteiz", HOME_ADDRESS]),
      mapLink: mapsRoute([HOME_ADDRESS, "San Juan de Gaztelugatxe", "Puerto de Bermeo", "Plaza de la Virgen Blanca, Vitoria-Gasteiz", HOME_ADDRESS]),
      itinerary: [
        {
          section: "Mañana · San Juan de Gaztelugatxe (reserva a las 10:30)",
          items: [
            { name: "Bajada y subida a la ermita", mapsUrl: mapsSearch("San Juan de Gaztelugatxe"), desc: "Entrada por Urizarreta: bajada por el camino hasta el puente de piedra y subida de los 241 escalones hasta la ermita. Tradición: tocar la campana tres veces." },
            { name: "Vuelta por Ermu", mapsUrl: mapsSearch("San Juan de Gaztelugatxe, acceso Ermu"), desc: "La vuelta se hace por el acceso de Ermu, unos 2 km cuesta arriba. Calculad unas 2 h en total: la vuelta cansa." },
            { name: "Café en Bermeo", mapsUrl: mapsSearch("Puerto de Bermeo"), desc: "A 10 min. Puerto pesquero con mucho encanto." }
          ]
        },
        {
          section: "Tarde · Vitoria-Gasteiz",
          items: [
            { name: "Plaza de la Virgen Blanca, Plaza de España y los Arquillos", image: "assets/images/vitoria_plaza.jpg", imageCredit: "Foto: Basotxerri · CC BY-SA 4.0 · Wikimedia Commons", mapsUrl: mapsSearch("Plaza de la Virgen Blanca, Vitoria-Gasteiz"), desc: "El corazón de la ciudad, a las puertas del Casco Medieval." },
            { name: "Casco Medieval en forma de almendra", mapsUrl: mapsSearch("Casco Medieval, Vitoria-Gasteiz"), desc: "Correría, Cuchillería, el Portalón y la Torre de los Anda." },
            { name: "Catedral de Santa María", mapsUrl: mapsSearch("Catedral de Santa María, Vitoria-Gasteiz"), desc: "Visita guiada «Abierto por obras», con casco y reservada con antelación; confirmad que hay pase el lunes. Abre de 10:00 a 14:00 y de 16:00 a 19:00, así que la franja que os encaja es a partir de las 16:00. Reservas: 945 255 135 o " + webLink("catedralvitoria.eus", "https://www.catedralvitoria.eus") + "." },
            { name: "Luces de Navidad", mapsUrl: mapsSearch("Calle Dato, Vitoria-Gasteiz"), desc: "Al anochecer, por el centro." }
          ]
        }
      ],
      cityGuide: {
        intro: "El lunes 7 no es festivo en Euskadi: los comercios abren, pero algunos museos y restaurantes cierran los lunes.",
        eating: "<p><strong>Comida en Vitoria:</strong> pintxos por Cuchillería y Kale Txikitxoa. El Ayuntamiento tiene una " + webLink("guía de restaurantes veg-friendly", "https://www.vitoria-gasteiz.org/docs/wb021/contenidosEstaticos/adjuntos/es/97/53/99753.pdf") + ", con varios que hacen menú vegetariano bajo petición.</p><p>⚠️ Los dos veganos más conocidos, <strong>Black Salad y Beganbai, no abren los lunes</strong>.</p>",
        planB: "<p><strong>Si hay temporal en la costa:</strong> cambiad Gaztelugatxe por el " + placeLink("Salto del Nervión", "Mirador del Salto del Nervión") + ", la cascada más alta de la Península (más de 200 m). En diciembre suele llevar agua. Está de camino a Vitoria: ~50 min desde Bilbao y ~50 min hasta Vitoria, con un paseo fácil de unos 40 min al mirador.</p><p>Cuando hay niebla no se ve nada, así que miradlo esa mañana. Salid de Bilbao a las 09:30 y hacia Vitoria sobre las 12:15.</p><p>Si vais al Plan B, cancelad la reserva de Gaztelugatxe para liberar la plaza.</p>"
      },
      schedule: [
        { time: "09:30", desc: "🚗 Salida hacia San Juan de Gaztelugatxe (~45 min)." },
        { time: "10:30", desc: "⛰️ San Juan de Gaztelugatxe. Calculad unas 2 h.", isFixed: true, fixedLabel: "🎟️ TURNO RESERVADO" },
        { time: "~12:30", desc: "☕ Café en Bermeo (10 min)." },
        { time: "13:00", desc: "🚗 A Vitoria (~1 h 10). Aparcad cerca del Casco Medieval." },
        { time: "~14:10", desc: "🍢 Comida: pintxos por Cuchillería y Kale Txikitxoa." },
        { time: "Tarde", desc: "🏰 Virgen Blanca, Plaza de España, Arquillos, Casco Medieval y Catedral de Santa María. Al anochecer, luces de Navidad." },
        { time: "~19:30", desc: "🚗 Vuelta a Bilbao (55 min). Llegada sobre las 20:25." }
      ],
      tips: [
        "Gaztelugatxe resbala: llevad calzado que agarre. El camino se cierra si hay temporal, y con aviso naranja se desaconseja subir.",
        "Comprobad Euskalmet esa misma mañana para decidir entre Gaztelugatxe y el Plan B.",
        "Confirmad que hay pase de «Abierto por obras» en la Catedral de Santa María el lunes."
      ]
    },
    {
      dayNum: 5,
      shortDate: "Mar 8",
      weatherDestinationIds: ["bilbao", "llanes", "santiago"],
      title: "Día 5 — Vuelta a casa con comida en Llanes",
      date: "MARTES, 8 DE DICIEMBRE DE 2026",
      subHeader: "Bilbao → Llanes → Santiago",
      image: "assets/images/llanes_cubos.jpg",
      imageCredit: "Foto: Zarateman · CC0 · Wikimedia Commons",
      summary: "Desayuno y recogida, salida antes de las 11:00 y parada para comer en Llanes, un pueblo bonito para estirar las piernas y ver los Cubos de la Memoria. Llegada a casa entre las 19:00 y las 19:30.",
      goal: "Volver con calma, partiendo el viaje con una buena parada a mitad de camino.",
      travelTimes: [
        { from: HOME_ADDRESS, to: "Llanes", desc: "≈ 181 km · 2 h", mapsUrl: mapsRoute([HOME_ADDRESS, "Llanes"]), icon: "🚗" },
        { from: "Llanes", to: "Santiago de Compostela", desc: "≈ 406 km · 4 h 30 min – 5 h", mapsUrl: mapsRoute(["Llanes", "Santiago de Compostela"]), icon: "🚗" }
      ],
      mapEmbed: mapsEmbed([HOME_ADDRESS, "Llanes", "Santiago de Compostela"]),
      mapLink: mapsRoute([HOME_ADDRESS, "Llanes", "Santiago de Compostela"]),
      itinerary: [
        {
          section: "Parada en ruta · Llanes",
          items: [
            { name: "Cubos de la Memoria", mapsUrl: mapsSearch("Cubos de la Memoria, Llanes"), desc: "La escollera del puerto de Llanes, pintada por Agustín Ibarrola. Un buen paseo para estirar las piernas antes de seguir." }
          ]
        }
      ],
      schedule: [
        { time: "Mañana", desc: "🧳 Desayuno y recogida." },
        { time: "11:00", desc: "🚗 Salida de Airbnb como tarde (hora de check-out).", isFixed: true, fixedLabel: "⏰ HORA LÍMITE" },
        { time: "~13:00", desc: "🍽️ Comida en Llanes (~2 h de coche) y Cubos de la Memoria." },
        { time: "14:30", desc: "🚗 Seguid viaje." },
        { time: "19:00 – 19:30", desc: "🏠 Llegada a casa." }
      ],
      tips: [
        "El martes 8 es día de mucho retorno de puente: contad con 30 – 60 min más y mirad el tráfico antes de salir.",
        "Si queréis llegar con más margen, comed en ruta algo rápido y estaréis sobre las 18:30."
      ]
    }
  ],
  accommodationsSummary: [
    { day: "Vie 4", city: "Bilbao", name: "Apartamento en Zamakola", mapsUrl: mapsSearch(HOME_ADDRESS), details: "Llegada ~22:00 · coche al garaje" },
    { day: "Sáb 5", city: "Bilbao", name: "Apartamento en Zamakola", mapsUrl: mapsSearch(HOME_ADDRESS), details: "2ª noche · regreso ~21:15" },
    { day: "Dom 6", city: "Bilbao", name: "Apartamento en Zamakola", mapsUrl: mapsSearch(HOME_ADDRESS), details: "3ª noche · coche en el garaje todo el día (partido)" },
    { day: "Lun 7", city: "Bilbao", name: "Apartamento en Zamakola", mapsUrl: mapsSearch(HOME_ADDRESS), details: "4ª noche · regreso ~20:25" },
    { day: "Mar 8", city: "Fin del viaje", name: "—", details: "Check-out a las 11:00 y vuelta a casa" }
  ],
  accommodationsDetailed: [
    {
      id: "zamakola",
      name: "Apartamento en Zamakola",
      stayDays: "4 noches · 4 – 8 de diciembre",
      location: "Bilbao",
      address: HOME_ADDRESS,
      gallery: [
        { url: "assets/images/bilbao_ria.jpg", caption: "🌊 La ría de Bilbao, a un paseo del alojamiento" }
      ],
      mapsUrl: mapsSearch(HOME_ADDRESS),
      roomType: "Airbnb · anfitrión: Andoni",
      mealPlan: "Check-out el martes 8 a las 11:00",
      description: "La base de todo el viaje, al lado de " + webLink("Obar Catracho", NEARBY_LANDMARK_URL) + " y a 7 minutos a pie del Casco Viejo, de modo que el domingo no hace falta el coche. Preguntad a Andoni si el garaje queda dentro de la Zona de Bajas Emisiones.",
      amenities: [
        "🚗 Garaje",
        "🚶 Casco Viejo a 7 min",
        "🌱 Garibolo cerca",
        "🕚 Salida a las 11:00"
      ]
    }
  ],
  generalRules: {
    driving: [
      "Ida y vuelta: el viernes por la tarde y el martes 8 hay mucha salida y retorno de puente. Contad con 30 – 60 min más y mirad el tráfico (DGT o Google Maps) antes de salir.",
      "Peajes: la AP-8 entre Bilbao y Donostia es de peaje. Hay alternativas gratuitas por la N-634, pero son más lentas.",
      "Etiqueta ambiental: Bilbao, Donostia y Vitoria tienen Zona de Bajas Emisiones, con multas de 200 € (100 € con pronto pago). Comprobad que vuestro coche puede entrar.",
      "ZBE de Bilbao: abarca Abando e Indautxu, con control automático por matrícula. Preguntad a Andoni si el garaje queda dentro.",
      "ZBE de Vitoria: cubre el Casco Medieval y parte del Ensanche; los coches sin etiqueta no pueden entrar.",
      "Aparcamiento: en Donostia es caro; id directos a un parking subterráneo. En Bilbao, coche guardado en el garaje del alojamiento.",
      "Sábado y lunes: las salidas de las 08:45 y las 09:30 están pensadas para llegar a la costa con luz y marea de mañana; anochece sobre las 17:35.",
      "Domingo: el partido empieza a las 16:15. No uséis el coche ese día: la zona de San Mamés se colapsa antes y después del partido. Mejor el metro: las líneas 1 y 2 paran en San Mamés."
    ],
    parkings: [
      { day: "Todo el viaje", name: "Garaje del alojamiento", location: HOME_ADDRESS, notes: "El coche se queda aquí todo el domingo.", mapsUrl: mapsSearch(HOME_ADDRESS) },
      { day: "Sáb 5", name: "Junto a la playa de Itzurun", location: "Zumaia", notes: "Para subir a la ermita de San Telmo.", mapsUrl: mapsSearch("Parking playa de Itzurun, Zumaia") },
      { day: "Sáb 5", name: "Parking Boulevard", location: "Donostia", notes: "Subterráneo, en el centro y junto a la Parte Vieja.", mapsUrl: mapsSearch("Parking Boulevard, San Sebastián") },
      { day: "Sáb 5", name: "Parking Okendo", location: "Donostia", notes: "Subterráneo, alternativa cerca del Kursaal.", mapsUrl: mapsSearch("Parking Okendo, San Sebastián") },
      { day: "Dom 6", name: "Sin coche: metro a San Mamés", location: "Bilbao", notes: "Líneas 1 y 2. La zona del estadio se colapsa antes y después del partido.", mapsUrl: mapsSearch("Metro San Mamés, Bilbao") },
      { day: "Lun 7", name: "Acceso de Urizarreta", location: "San Juan de Gaztelugatxe", notes: "Punto de control de la entrada: llevad el tique en el móvil o impreso.", mapsUrl: mapsSearch("San Juan de Gaztelugatxe, acceso Urizarreta") },
      { day: "Lun 7", name: "Cerca del Casco Medieval", location: "Vitoria-Gasteiz", notes: "Si vuestro coche no tiene etiqueta, aparcad fuera de la ZBE.", mapsUrl: mapsSearch("Parking Casco Medieval, Vitoria-Gasteiz") },
      { day: "Lun 7 · Plan B", name: "Mirador del Salto del Nervión", location: "Monte Santiago", notes: "Paseo fácil de unos 40 min hasta el mirador.", mapsUrl: mapsSearch("Mirador del Salto del Nervión") }
    ],
    bookings: [
      { id: "comida-donostia", day: "Sáb 5", item: "Comida del sábado en Donostia", place: "Parte Vieja, San Sebastián", date: "5 dic", time: "~13:35", price: "—" },
      { id: "guggenheim-domingo", day: "Dom 6", item: "Museo Guggenheim (los cuatro)", place: "Museo Guggenheim Bilbao", date: "6 dic", time: "10:00", price: "12 € (confirmar)", url: "https://www.guggenheim-bilbao.eus" },
      { id: "cena-domingo", day: "Dom 6", item: "Cena del domingo en Bilbao", place: "Bilbao", date: "6 dic", time: "~18:30", price: "—" },
      { id: "gaztelugatxe", day: "Lun 7", item: "San Juan de Gaztelugatxe", place: "San Juan de Gaztelugatxe", date: "7 dic", time: "10:30", price: "Gratis", url: "https://www.bizkaia.eus/es/gaztelugatxe" },
      { id: "catedral", day: "Lun 7", item: "Catedral de Santa María · «Abierto por obras»", place: "Catedral de Santa María, Vitoria-Gasteiz", date: "7 dic", time: "Desde 16:00", price: "≈ 9 € (confirmar)", url: "https://www.catedralvitoria.eus" }
    ],
    checks: [
      { id: "mareas-sabado", text: "Mirar la tabla de mareas de Zumaia para el sábado 5." },
      { id: "gaztelugatxe-calendario", text: "Comprobar en el calendario de reservas de Gaztelugatxe de 2026 que el lunes 7 está incluido." },
      { id: "entrada-partido", text: "Tener a mano la entrada del Athletic – Real Madrid (domingo 6, 16:15, San Mamés)." },
      { id: "horarios-domingo", text: "Confirmar que Sustraiak, Bohemian Lane y Okapi abren el domingo." },
      { id: "zbe", text: "Comprobar que el coche puede entrar en las Zonas de Bajas Emisiones (Bilbao, Donostia y Vitoria)." },
      { id: "garaje-zbe", text: "Preguntar a Andoni si el garaje queda dentro de la zona de Bilbao." },
      { id: "avisar-andoni", text: "Avisar a Andoni de que llegaréis sobre las 22:00 el viernes." }
    ]
  },
  gastronomy: {
    bilbao: [
      { name: "Garibolo", tag: "Vegetariano", mapsUrl: mapsSearch("Garibolo, Fernández del Campo 7, Bilbao"), desc: "Fernández del Campo 7, cerca del alojamiento. Buena opción para una cena tranquila el domingo. Tel. 944 223 255." },
      { name: "Sustraiak", tag: "Menú vegetariano", mapsUrl: mapsSearch("Sustraiak, Bilbao"), desc: "Productos agroecológicos, de proximidad y de temporada.", warning: "Aparece en los directorios como catering: comprobad que da comidas en sala y que abre en domingo." },
      { name: "Bohemian Lane", tag: "Vegano", mapsUrl: mapsSearch("Bohemian Lane, Carnicería Vieja 3, Bilbao"), desc: "Carnicería Vieja 3, en el Casco Viejo.", warning: "Confirmad que abre en domingo." },
      { name: "Café Obrador Okapi", tag: "Café", mapsUrl: mapsSearch("Café Obrador Okapi, Belostikale 26, Bilbao"), desc: "Belostikale 26, junto a la catedral. Para un café y algo dulce el domingo por la tarde.", warning: "Confirmad el horario de domingo." },
      { name: "Mandrágora", tag: "Vegetariano", mapsUrl: mapsSearch("Mandrágora vegetariano, Bilbao"), desc: "Incluido en vuestra lista de opciones vegetarianas de Bilbao.", warning: "No hemos podido confirmar la dirección: buscadlo antes de ir." }
    ],
    donostia: [
      { name: "El Mapa Verde", tag: "100 % vegano", mapsUrl: mapsSearch("Mapa Verde, Trueba 4, San Sebastián"), desc: "Calle Trueba 4, junto a Tabakalera, con barra de pintxos. Tel. 943 84 18 62.", warning: "Confirmad que abre el sábado." },
      { name: "Bar Aukera", tag: "Veg. y vegano", mapsUrl: mapsSearch("Bar Aukera, San Sebastián"), desc: "Parte Vieja, con opciones vegetarianas y veganas." },
      { name: "Bar Ganbara", tag: "Opciones veg.", mapsUrl: mapsSearch("Bar Ganbara, San Jerónimo 21, San Sebastián"), desc: "San Jerónimo 21, Parte Vieja, con opciones vegetarianas." },
      { name: "La Cepa de Bernardo", tag: "Opciones veg.", mapsUrl: mapsSearch("La Cepa de Bernardo, San Sebastián"), desc: "Parte Vieja, con opciones vegetarianas." },
      { name: "Labrit Berri", tag: "Opciones veg.", mapsUrl: mapsSearch("Labrit Berri, Gros, San Sebastián"), desc: "En Gros. Para el último pintxo antes de volver." },
      { name: "La Rebotika", tag: "Opciones veg.", mapsUrl: mapsSearch("La Rebotika, Gros, San Sebastián"), desc: "En Gros, con opciones vegetarianas." }
    ],
    vitoria: [
      { name: "Black Salad", tag: "Vegano", mapsUrl: mapsSearch("Black Salad, Manuel Iradier 84, Vitoria-Gasteiz"), desc: "Manuel Iradier 84. De martes a sábado. Tel. 945 038 503.", warning: "No abre el lunes 7, el día que estaréis en Vitoria." },
      { name: "Beganbai", tag: "Vegano", mapsUrl: mapsSearch("Beganbai, Badaia 17, Vitoria-Gasteiz"), desc: "Badaia 17. De viernes a domingo. Tel. 945 06 64 11.", warning: "No abre el lunes 7, el día que estaréis en Vitoria." },
      { name: "Guía veg-friendly del Ayuntamiento", tag: "Guía", mapsUrl: "https://www.vitoria-gasteiz.org/docs/wb021/contenidosEstaticos/adjuntos/es/97/53/99753.pdf", desc: "Reúne más sitios, varios con menú vegetariano bajo petición." }
    ],
    traditional: [
      { name: "Pintxos", desc: "La tapa vasca, en barra y de pie. Se piden unos pocos en cada bar y se sigue la ronda." },
      { name: "Bacalao al pil-pil", desc: "Bacalao confitado en aceite, ligado con su propia gelatina hasta formar una salsa." },
      { name: "Marmitako", desc: "Guiso marinero de bonito y patata, nacido en los barcos pesqueros del Cantábrico." },
      { name: "Alubias de Tolosa", desc: "Alubia negra guisada lentamente, que suele servirse con sacramentos de cerdo aparte." }
    ],
    drinks: [
      { name: "Txakoli", desc: "Vino blanco joven, ligeramente ácido y con un punto de aguja. Getaria y Bizkaia tienen denominación propia." },
      { name: "Sagardoa", desc: "Sidra natural vasca, escanciada desde lo alto para airearla." },
      { name: "Rioja Alavesa", desc: "Los tintos del sur de Álava, una buena compañía para la tarde en Vitoria." },
      { name: "Pantxineta", desc: "Hojaldre relleno de crema y cubierto de almendra, típico de Donostia." },
      { name: "Carolina", desc: "El dulce clásico de Bilbao: base de hojaldre, merengue en punta y baño de yema y chocolate." }
    ]
  },
  barTips: {
    lookFor: ["Tortilla", "Setas", "Pimientos rellenos de verdura", "Guindillas", "Queso Idiazabal"],
    askFor: ["Anchoa", "Bonito", "Caldo de pescado"],
    notes: "La gilda lleva anchoa, y el Idiazabal se elabora con cuajo animal: tenedlo en cuenta si sois estrictos."
  },
  souvenirs: [
    { name: "Queso Idiazabal", icon: "🧀", desc: "Queso de oveja latxa, a menudo ahumado. Lo encontraréis en tiendas de la Parte Vieja de Donostia o del Casco Viejo (el domingo los puestos del Mercado de la Ribera están cerrados). Envasado al vacío aguanta bien el viaje." },
    { name: "Txakoli", icon: "🍾", desc: "Una botella de Getaria o de Bizkaia, el recuerdo líquido más típico de la costa." },
    { name: "Piparras de Ibarra", icon: "🌶️", desc: "Guindillas verdes en conserva, suaves y con su punto de acidez. Un clásico vegetariano de las barras vascas." },
    { name: "Alubias de Tolosa", icon: "🫘", desc: "Alubia negra de Gipuzkoa. Pesa poco y se guarda durante meses." },
    { name: "Vasquitos y Nesquitas", icon: "🍫", desc: "Los bombones tradicionales de Vitoria-Gasteiz, perfectos para la tarde del lunes en la Almendra." },
    { name: "Txapela", icon: "🧢", desc: "La boina vasca, de lana y más ancha que la boina común. Práctica, además, para el frío de diciembre." },
    { name: "Artesanía con lauburu", icon: "🍀", desc: "Joyas, llaveros y detalles con la cruz vasca de cuatro cabezas, un símbolo presente en todo el territorio." }
  ],
  recommendedApps: [
    { name: "Google Maps (sin conexión)", category: "Navegación", desc: "Descargad la zona de la costa vasca: en los accesos a Gaztelugatxe y al Salto del Nervión la cobertura puede fallar." },
    { name: "DGT 3.0", category: "Navegación", desc: "La aplicación oficial de tráfico, para consultar incidencias y retenciones antes de salir el viernes y el martes." },
    { name: "Metro Bilbao", category: "Navegación", desc: "Horarios y trayectos del metro. El domingo, para ir a San Mamés: las líneas 1 y 2 paran allí." },
    { name: "Telpark", category: "Navegación", desc: "Para localizar y pagar aparcamientos en las ciudades." },
    { name: "Euskalmet", category: "Meteorología", desc: "La previsión oficial de Euskadi. Consultadla el lunes por la mañana para decidir entre Gaztelugatxe y el Plan B." },
    { name: "HappyCow", category: "Gastronomía", desc: "Restaurantes veganos y vegetarianos cercanos, con horarios y opiniones recientes de otros viajeros." },
    { name: "TheFork", category: "Gastronomía", desc: "Reservas en restaurantes, muy útil en un puente en el que todo se llena." },
    { name: "Google Translate (cámara)", category: "Utilidades", desc: "Muy útil para traducir del euskera carteles y cartas con la cámara del móvil." }
  ],
  weatherDestinations: [
    { id: "bilbao", name: "Bilbao", category: "ciudades", region: "Bizkaia · Vuestra base", days: "Todo el viaje", lat: 43.263, lon: -2.935, clothingTip: "Chubasquero y capas: en diciembre llueve a menudo y hace entre 6 y 12 °C.", image: "assets/images/bilbao_ria.jpg" },
    { id: "zumaia", name: "Zumaia", category: "costa", region: "Gipuzkoa · Flysch", days: "Sáb 5", lat: 43.297, lon: -2.257, clothingTip: "Cortavientos y calzado que agarre: el flysch resbala, y en los acantilados sopla fuerte.", image: "assets/images/zumaia_flysch.jpg" },
    { id: "donostia", name: "Donostia", category: "ciudades", region: "Gipuzkoa · La Concha", days: "Sáb 5", lat: 43.318, lon: -1.981, clothingTip: "Abrigo y chubasquero para el paseo de la Concha, con el viento del mar de frente.", image: "assets/images/donostia_concha.jpg" },
    { id: "gaztelugatxe", name: "Gaztelugatxe y Bermeo", category: "costa", region: "Bizkaia · Costa", days: "Lun 7", lat: 43.447, lon: -2.785, clothingTip: "Calzado que agarre, porque los escalones resbalan. Consultad Euskalmet: con aviso naranja no subáis.", image: "assets/images/gaztelugatxe.jpg" },
    { id: "vitoria", name: "Vitoria-Gasteiz", category: "ciudades", region: "Álava · Interior", days: "Lun 7", lat: 42.847, lon: -2.672, clothingTip: "Abrigaos bien: por estar en el interior suele hacer más frío que en la costa, sobre todo al anochecer.", image: "assets/images/vitoria_plaza.jpg" },
    { id: "nervion", name: "Salto del Nervión", category: "interior", region: "Monte Santiago · Plan B", days: "Lun 7 (Plan B)", lat: 42.953, lon: -3.032, clothingTip: "Es zona alta y expuesta: abrigo, gorro y calzado de montaña. Con niebla no se ve la cascada." },
    { id: "llanes", name: "Llanes", category: "costa", region: "Asturias · Parada en ruta", days: "Vie 4 y Mar 8", lat: 43.42, lon: -4.755, clothingTip: "Chubasquero a mano para estirar las piernas por el puerto.", image: "assets/images/llanes_cubos.jpg" },
    { id: "santiago", name: "Santiago de Compostela", category: "ciudades", region: "Galicia · Salida y llegada", days: "Vie 4 y Mar 8", lat: 42.878, lon: -8.544, clothingTip: "Mirad la previsión antes de salir, sobre todo si hay lluvia en la A-8." }
  ],
  quickLinks: [
    { icon: "🎟️", name: "Reserva de Gaztelugatxe", desc: "Tique gratuito de la Diputación de Bizkaia", url: "https://www.bizkaia.eus/es/gaztelugatxe" },
    { icon: "🎨", name: "Museo Guggenheim", desc: "Entradas y exposiciones", url: "https://www.guggenheim-bilbao.eus" },
    { icon: "⛪", name: "Catedral de Vitoria", desc: "Visita «Abierto por obras»", url: "https://www.catedralvitoria.eus" },
    { icon: "🌦️", name: "Euskalmet", desc: "Previsión y avisos oficiales de Euskadi", url: "https://www.euskalmet.euskadi.eus" },
    { icon: "🌊", name: "Mareas de Zumaia", desc: "Tabla de mareas para el sábado 5", url: "https://www.tablademareas.com/es/guipuzcoa/zumaia" },
    { icon: "🚇", name: "Metro Bilbao", desc: "Horarios; líneas 1 y 2 a San Mamés", url: "https://www.metrobilbao.eus" },
    { icon: "🖼️", name: "Museo de Bellas Artes", desc: "Horario de domingo (ya no es gratuito)", url: "https://www.museobilbao.com" },
    { icon: "🚦", name: "Tráfico (DGT)", desc: "Estado de las carreteras en tiempo real", url: "https://infocar.dgt.es/etraffic/" },
    { icon: "🚡", name: "Monte Igeldo", desc: "Horario del funicular", url: "https://www.monteigueldo.es" },
    { icon: "🪨", name: "Geoparque de la Costa Vasca", desc: "Salidas en barco por el flysch", url: "https://geoparkea.eus" }
  ],
  photoCredits: [
    { place: "Ría de Bilbao", author: "Zarateman", license: "CC0" },
    { place: "Museo Guggenheim Bilbao", author: "Jules Verne Times Two", license: "CC BY-SA 4.0" },
    { place: "Flysch de Zumaia", author: "Simoncio", license: "CC BY-SA 4.0" },
    { place: "Bahía de la Concha, Donostia", author: "Ermell", license: "CC BY-SA 4.0" },
    { place: "San Juan de Gaztelugatxe", author: "Diego Delso", license: "CC BY-SA 4.0" },
    { place: "Plaza de la Virgen Blanca, Vitoria-Gasteiz", author: "Basotxerri", license: "CC BY-SA 4.0" },
    { place: "Cubos de la Memoria, Llanes", author: "Zarateman", license: "CC0" }
  ]
};

window.FIXED_SCHEDULES_DATA = [
  { id: "ida", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Santiago → Bilbao por la A-8", date: "Vie 4 dic", dayNum: 1, departure: "15:00 — Santiago", arrival: "~22:00 — Bilbao", details: "6 h 30 – 7 h con parada para cenar en Llanes o Ribadesella. Si podéis salir antes de las 14:00, mejor.", status: "Salida aconsejada" },
  { id: "zumaia", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Bilbao → Zumaia (AP-8, peaje)", date: "Sáb 5 dic", dayNum: 2, departure: "08:45 — Bilbao", arrival: "~09:45 — Zumaia", details: "~1 h. Pensada para llegar a la costa con luz y marea de mañana.", status: "Salida aconsejada" },
  { id: "donostia", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Zumaia → Donostia", date: "Sáb 5 dic", dayNum: 2, departure: "13:00 — Zumaia", arrival: "~13:35 — Donostia", details: "~35 min. Id directos a un parking subterráneo.", status: "Salida aconsejada" },
  { id: "donostia-bilbao", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Donostia → Bilbao", date: "Sáb 5 dic", dayNum: 2, departure: "20:00 — Donostia", arrival: "~21:15 — Bilbao", details: "~1 h 15.", status: "Salida aconsejada" },
  { id: "metro-san-mames", category: "coche", icon: "🚇", tag: "METRO", title: "Casco Viejo → San Mamés", date: "Dom 6 dic", dayNum: 3, departure: "15:15 — Casco Viejo", arrival: "~15:30 — San Mamés", details: "~10 min en metro (líneas 1 y 2), solo quien va al partido. El coche se queda en el garaje: la zona se colapsa antes y después.", status: "Salida aconsejada" },
  { id: "gaztelugatxe", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Bilbao → San Juan de Gaztelugatxe", date: "Lun 7 dic", dayNum: 4, departure: "09:30 — Bilbao", arrival: "~10:15 — Gaztelugatxe", details: "~45 min, con margen para el turno de las 10:30.", status: "Salida aconsejada" },
  { id: "bermeo", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Gaztelugatxe → Bermeo (café)", date: "Lun 7 dic", dayNum: 4, departure: "~12:30 — Gaztelugatxe", arrival: "~12:40 — Bermeo", details: "~10 min.", status: "Salida aconsejada" },
  { id: "vitoria", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Bermeo → Vitoria-Gasteiz", date: "Lun 7 dic", dayNum: 4, departure: "13:00 — Bermeo", arrival: "~14:10 — Vitoria", details: "~1 h 10. Aparcad cerca del Casco Medieval.", status: "Salida aconsejada" },
  { id: "vitoria-bilbao", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Vitoria-Gasteiz → Bilbao", date: "Lun 7 dic", dayNum: 4, departure: "19:30 — Vitoria", arrival: "~20:25 — Bilbao", details: "~55 min.", status: "Salida aconsejada" },
  { id: "plan-b", category: "coche", icon: "☔", tag: "PLAN B", title: "Bilbao → Salto del Nervión → Vitoria", date: "Lun 7 dic", dayNum: 4, departure: "09:30 — Bilbao", arrival: "~13:05 — Vitoria (salid del mirador sobre las 12:15)", details: "~50 min hasta el mirador y ~50 min de allí a Vitoria. Solo si hay temporal en la costa.", status: "Alternativa" },
  { id: "llanes", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Bilbao → Llanes (comida)", date: "Mar 8 dic", dayNum: 5, departure: "11:00 — Bilbao", arrival: "~13:00 — Llanes", details: "~2 h. Día de mucho retorno de puente: mirad el tráfico antes de salir.", status: "Salida aconsejada" },
  { id: "vuelta", category: "coche", icon: "🚗", tag: "TRAYECTO", title: "Llanes → Santiago", date: "Mar 8 dic", dayNum: 5, departure: "14:30 — Llanes", arrival: "19:00 – 19:30 — Santiago", details: "4 h 30 – 5 h.", status: "Salida aconsejada" },
  { id: "reserva-guggenheim", category: "reserva", icon: "🎨", tag: "RESERVA", title: "Museo Guggenheim Bilbao", date: "Dom 6 dic", dayNum: 3, time: "10:00", location: "Abandoibarra, Bilbao", details: "Los cuatro juntos. Comprad las entradas online. Calculad 2 h. Cierra los lunes.", status: "Por reservar" },
  { id: "partido", category: "reserva", icon: "⚽", tag: "PARTIDO", title: "Athletic – Real Madrid", date: "Dom 6 dic", dayNum: 3, time: "16:15", location: "Estadio San Mamés, Bilbao", details: "Quien va ya tiene la entrada. Termina hacia las 18:15; a las ~18:30 os juntáis los cuatro para cenar.", status: "Entrada comprada" },
  { id: "reserva-gaztelugatxe", category: "reserva", icon: "⛰️", tag: "RESERVA", title: "San Juan de Gaztelugatxe", date: "Lun 7 dic", dayNum: 4, time: "10:30", location: "Entrada por Urizarreta", details: "En el puente de diciembre el acceso exige reserva gratuita con hora en la web de la Diputación (bizkaia.eus/gaztelugatxe); comprobad en el calendario de 2026 que el día 7 está incluido. Llevad el tique en el móvil o impreso. Última entrada a las 17:00 en esta época.", status: "Por reservar" },
  { id: "reserva-catedral", category: "reserva", icon: "⛪", tag: "RESERVA", title: "Catedral de Santa María · «Abierto por obras»", date: "Lun 7 dic", dayNum: 4, time: "Desde las 16:00", location: "Casco Medieval, Vitoria-Gasteiz", details: "Visita guiada con casco; confirmad que hay pase el lunes. Se reserva con antelación: 945 255 135 o visitas@catedralvitoria.eus.", status: "Por reservar" },
  { id: "checkout", category: "reserva", icon: "⏰", tag: "HORA LÍMITE", title: "Check-out del Airbnb", date: "Mar 8 dic", dayNum: 5, time: "11:00", location: HOME_ADDRESS, details: "Salida como tarde a esta hora.", status: "Hora límite" }
];
