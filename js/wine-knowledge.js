// Conoscenze di base per arricchire i dati: denominazioni -> regione/vitigno/tipologia,
// elenco vitigni, prefissi GS1 dei codici a barre.
// L'ordine conta: le voci più specifiche vengono prima.

export const DENOMINAZIONI = [
  // Piemonte
  ['roero arneis', 'Roero Arneis DOCG', 'Piemonte, Italia', 'Arneis', 'Bianco'],
  ['langhe nebbiolo', 'Langhe Nebbiolo DOC', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['nebbiolo d.?alba', "Nebbiolo d'Alba DOC", 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['barolo chinato', 'Barolo Chinato', 'Piemonte, Italia', 'Nebbiolo', 'Fortificato'],
  ['barolo', 'Barolo DOCG', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['barbaresco', 'Barbaresco DOCG', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['roero', 'Roero DOCG', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['gattinara', 'Gattinara DOCG', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['ghemme', 'Ghemme DOCG', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['\\bboca\\b', 'Boca DOC', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['bramaterra', 'Bramaterra DOC', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['lessona', 'Lessona DOC', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['carema', 'Carema DOC', 'Piemonte, Italia', 'Nebbiolo', 'Rosso'],
  ['nizza', 'Nizza DOCG', 'Piemonte, Italia', 'Barbera', 'Rosso'],
  ['barbera d.?asti', "Barbera d'Asti DOCG", 'Piemonte, Italia', 'Barbera', 'Rosso'],
  ['barbera d.?alba', "Barbera d'Alba DOC", 'Piemonte, Italia', 'Barbera', 'Rosso'],
  ['barbera del monferrato', 'Barbera del Monferrato', 'Piemonte, Italia', 'Barbera', 'Rosso'],
  ['dogliani', 'Dogliani DOCG', 'Piemonte, Italia', 'Dolcetto', 'Rosso'],
  ['dolcetto d.?alba', "Dolcetto d'Alba DOC", 'Piemonte, Italia', 'Dolcetto', 'Rosso'],
  ['diano d.?alba', "Diano d'Alba DOCG", 'Piemonte, Italia', 'Dolcetto', 'Rosso'],
  ['ovada', 'Ovada DOCG', 'Piemonte, Italia', 'Dolcetto', 'Rosso'],
  ['gavi', 'Gavi DOCG', 'Piemonte, Italia', 'Cortese', 'Bianco'],
  ['moscato d.?asti', "Moscato d'Asti DOCG", 'Piemonte, Italia', 'Moscato bianco', 'Dolce / passito'],
  ['asti spumante|\\basti docg', 'Asti DOCG', 'Piemonte, Italia', 'Moscato bianco', 'Bollicine'],
  ['brachetto', "Brachetto d'Acqui DOCG", 'Piemonte, Italia', 'Brachetto', 'Dolce / passito'],
  ['grignolino', 'Grignolino', 'Piemonte, Italia', 'Grignolino', 'Rosso'],
  ['freisa', 'Freisa', 'Piemonte, Italia', 'Freisa', 'Rosso'],
  ['ruch[eè]', 'Ruchè di Castagnole Monferrato DOCG', 'Piemonte, Italia', 'Ruchè', 'Rosso'],
  ['erbaluce', 'Erbaluce di Caluso DOCG', 'Piemonte, Italia', 'Erbaluce', 'Bianco'],
  ['timorasso|derthona', 'Colli Tortonesi Timorasso', 'Piemonte, Italia', 'Timorasso', 'Bianco'],
  ['alta langa', 'Alta Langa DOCG', 'Piemonte, Italia', 'Pinot Nero, Chardonnay', 'Bollicine'],
  ['pelaverga', 'Verduno Pelaverga DOC', 'Piemonte, Italia', 'Pelaverga', 'Rosso'],
  ['nascetta', 'Langhe Nascetta', 'Piemonte, Italia', 'Nascetta', 'Bianco'],
  ['pinerolese', 'Pinerolese DOC', 'Piemonte, Italia', '', ''],
  ['valsusa|aven[aà]', 'Valsusa DOC', 'Piemonte, Italia', '', ''],
  ['\\blanghe\\b', 'Langhe DOC', 'Piemonte, Italia', '', ''],
  ['monferrato', 'Monferrato', 'Piemonte, Italia', '', ''],
  // Valle d'Aosta, Liguria
  ['torrette', "Valle d'Aosta Torrette", "Valle d'Aosta, Italia", 'Petit Rouge', 'Rosso'],
  ['fumin', "Valle d'Aosta Fumin", "Valle d'Aosta, Italia", 'Fumin', 'Rosso'],
  ['cinque terre', 'Cinque Terre DOC', 'Liguria, Italia', 'Bosco, Albarola, Vermentino', 'Bianco'],
  ['pigato', 'Riviera Ligure di Ponente Pigato', 'Liguria, Italia', 'Pigato', 'Bianco'],
  ['rossese', 'Rossese di Dolceacqua', 'Liguria, Italia', 'Rossese', 'Rosso'],
  // Lombardia
  ['franciacorta', 'Franciacorta DOCG', 'Lombardia, Italia', 'Chardonnay, Pinot Nero', 'Bollicine'],
  ['sforzato|sfursat', 'Sforzato di Valtellina DOCG', 'Lombardia, Italia', 'Nebbiolo (Chiavennasca)', 'Rosso'],
  ['valtellina|sassella|inferno|grumello|valgella', 'Valtellina Superiore DOCG', 'Lombardia, Italia', 'Nebbiolo (Chiavennasca)', 'Rosso'],
  ['lugana', 'Lugana DOC', 'Lombardia/Veneto, Italia', 'Turbiana', 'Bianco'],
  ['oltrep[oò]', 'Oltrepò Pavese', 'Lombardia, Italia', '', ''],
  ['buttafuoco', 'Buttafuoco dell\'Oltrepò Pavese', 'Lombardia, Italia', 'Croatina, Barbera', 'Rosso'],
  // Veneto
  ['amarone', 'Amarone della Valpolicella DOCG', 'Veneto, Italia', 'Corvina, Corvinone, Rondinella', 'Rosso'],
  ['recioto della valpolicella', 'Recioto della Valpolicella DOCG', 'Veneto, Italia', 'Corvina, Rondinella', 'Dolce / passito'],
  ['ripasso', 'Valpolicella Ripasso DOC', 'Veneto, Italia', 'Corvina, Corvinone, Rondinella', 'Rosso'],
  ['valpolicella', 'Valpolicella DOC', 'Veneto, Italia', 'Corvina, Corvinone, Rondinella', 'Rosso'],
  ['bardolino chiaretto', 'Bardolino Chiaretto', 'Veneto, Italia', 'Corvina, Rondinella', 'Rosato'],
  ['bardolino', 'Bardolino DOC', 'Veneto, Italia', 'Corvina, Rondinella', 'Rosso'],
  ['recioto di soave', 'Recioto di Soave DOCG', 'Veneto, Italia', 'Garganega', 'Dolce / passito'],
  ['soave', 'Soave DOC', 'Veneto, Italia', 'Garganega', 'Bianco'],
  ['custoza', 'Custoza DOC', 'Veneto, Italia', 'Garganega, Trebbiano, Cortese', 'Bianco'],
  ['valdobbiadene|conegliano|cartizze|asolo prosecco', 'Conegliano Valdobbiadene Prosecco DOCG', 'Veneto, Italia', 'Glera', 'Bollicine'],
  ['prosecco', 'Prosecco DOC', 'Veneto/Friuli, Italia', 'Glera', 'Bollicine'],
  // Trentino-Alto Adige
  ['teroldego', 'Teroldego Rotaliano DOC', 'Trentino, Italia', 'Teroldego', 'Rosso'],
  ['trento doc|\\btrentodoc', 'Trento DOC', 'Trentino, Italia', 'Chardonnay, Pinot Nero', 'Bollicine'],
  ['marzemino', 'Trentino Marzemino', 'Trentino, Italia', 'Marzemino', 'Rosso'],
  ['santa maddalena|st\\.? magdalen', 'Santa Maddalena', 'Alto Adige, Italia', 'Schiava', 'Rosso'],
  ['lagrein', 'Alto Adige Lagrein', 'Alto Adige, Italia', 'Lagrein', 'Rosso'],
  ['alto adige|s[uü]dtirol', 'Alto Adige DOC', 'Alto Adige, Italia', '', ''],
  // Friuli
  ['picolit', 'Colli Orientali del Friuli Picolit DOCG', 'Friuli-Venezia Giulia, Italia', 'Picolit', 'Dolce / passito'],
  ['ramandolo', 'Ramandolo DOCG', 'Friuli-Venezia Giulia, Italia', 'Verduzzo', 'Dolce / passito'],
  ['collio', 'Collio DOC', 'Friuli-Venezia Giulia, Italia', '', ''],
  ['friuli', 'Friuli', 'Friuli-Venezia Giulia, Italia', '', ''],
  // Emilia-Romagna
  ['lambrusco', 'Lambrusco', 'Emilia-Romagna, Italia', 'Lambrusco', 'Rosso'],
  ['romagna sangiovese|sangiovese di romagna', 'Romagna Sangiovese DOC', 'Emilia-Romagna, Italia', 'Sangiovese', 'Rosso'],
  ['albana', 'Romagna Albana DOCG', 'Emilia-Romagna, Italia', 'Albana', 'Bianco'],
  ['gutturnio', 'Gutturnio DOC', 'Emilia-Romagna, Italia', 'Barbera, Croatina', 'Rosso'],
  ['pignoletto', 'Pignoletto DOC', 'Emilia-Romagna, Italia', 'Grechetto gentile', 'Bianco'],
  // Toscana
  ['brunello', 'Brunello di Montalcino DOCG', 'Toscana, Italia', 'Sangiovese', 'Rosso'],
  ['rosso di montalcino', 'Rosso di Montalcino DOC', 'Toscana, Italia', 'Sangiovese', 'Rosso'],
  ['nobile di montepulciano', 'Vino Nobile di Montepulciano DOCG', 'Toscana, Italia', 'Sangiovese (Prugnolo gentile)', 'Rosso'],
  ['rosso di montepulciano', 'Rosso di Montepulciano DOC', 'Toscana, Italia', 'Sangiovese', 'Rosso'],
  ['chianti classico', 'Chianti Classico DOCG', 'Toscana, Italia', 'Sangiovese', 'Rosso'],
  ['chianti', 'Chianti DOCG', 'Toscana, Italia', 'Sangiovese', 'Rosso'],
  ['morellino', 'Morellino di Scansano DOCG', 'Toscana, Italia', 'Sangiovese', 'Rosso'],
  ['bolgheri|sassicaia|ornellaia', 'Bolgheri DOC', 'Toscana, Italia', 'Cabernet Sauvignon, Merlot, Cabernet Franc', 'Rosso'],
  ['vernaccia di san gimignano', 'Vernaccia di San Gimignano DOCG', 'Toscana, Italia', 'Vernaccia', 'Bianco'],
  ['carmignano', 'Carmignano DOCG', 'Toscana, Italia', 'Sangiovese, Cabernet', 'Rosso'],
  ['montecucco', 'Montecucco', 'Toscana, Italia', 'Sangiovese', 'Rosso'],
  ['vin santo', 'Vin Santo', 'Toscana, Italia', 'Trebbiano, Malvasia', 'Dolce / passito'],
  ['toscana igt|\\btoscana\\b', 'Toscana IGT', 'Toscana, Italia', '', ''],
  // Umbria, Marche, Abruzzo, Lazio
  ['sagrantino', 'Montefalco Sagrantino DOCG', 'Umbria, Italia', 'Sagrantino', 'Rosso'],
  ['montefalco', 'Montefalco Rosso DOC', 'Umbria, Italia', 'Sangiovese, Sagrantino', 'Rosso'],
  ['orvieto', 'Orvieto DOC', 'Umbria, Italia', 'Grechetto, Trebbiano (Procanico)', 'Bianco'],
  ['torgiano', 'Torgiano', 'Umbria, Italia', 'Sangiovese', 'Rosso'],
  ['verdicchio', 'Verdicchio', 'Marche, Italia', 'Verdicchio', 'Bianco'],
  ['rosso con[eè]ro|\\bconero\\b', 'Rosso Conero / Conero', 'Marche, Italia', 'Montepulciano', 'Rosso'],
  ['rosso piceno', 'Rosso Piceno DOC', 'Marche, Italia', 'Montepulciano, Sangiovese', 'Rosso'],
  ['lacrima di morro', "Lacrima di Morro d'Alba DOC", 'Marche, Italia', 'Lacrima', 'Rosso'],
  ['offida', 'Offida DOCG', 'Marche, Italia', '', ''],
  ['cerasuolo d.?abruzzo', "Cerasuolo d'Abruzzo DOC", 'Abruzzo, Italia', 'Montepulciano', 'Rosato'],
  ['montepulciano d.?abruzzo', "Montepulciano d'Abruzzo DOC", 'Abruzzo, Italia', 'Montepulciano', 'Rosso'],
  ['trebbiano d.?abruzzo', "Trebbiano d'Abruzzo DOC", 'Abruzzo, Italia', 'Trebbiano abruzzese', 'Bianco'],
  ['frascati', 'Frascati DOC', 'Lazio, Italia', 'Malvasia, Trebbiano', 'Bianco'],
  ['cesanese', 'Cesanese del Piglio DOCG', 'Lazio, Italia', 'Cesanese', 'Rosso'],
  ['est!? ?est', 'Est! Est!! Est!!! di Montefiascone', 'Lazio, Italia', 'Trebbiano, Malvasia', 'Bianco'],
  // Sud
  ['taurasi', 'Taurasi DOCG', 'Campania, Italia', 'Aglianico', 'Rosso'],
  ['aglianico del vulture', 'Aglianico del Vulture DOC', 'Basilicata, Italia', 'Aglianico', 'Rosso'],
  ['aglianico del taburno', 'Aglianico del Taburno DOCG', 'Campania, Italia', 'Aglianico', 'Rosso'],
  ['fiano di avellino', 'Fiano di Avellino DOCG', 'Campania, Italia', 'Fiano', 'Bianco'],
  ['greco di tufo', 'Greco di Tufo DOCG', 'Campania, Italia', 'Greco', 'Bianco'],
  ['lacryma christi', 'Lacryma Christi del Vesuvio', 'Campania, Italia', '', ''],
  ['primitivo di manduria', 'Primitivo di Manduria DOC', 'Puglia, Italia', 'Primitivo', 'Rosso'],
  ['gioia del colle', 'Gioia del Colle DOC', 'Puglia, Italia', 'Primitivo', 'Rosso'],
  ['salice salentino', 'Salice Salentino DOC', 'Puglia, Italia', 'Negroamaro', 'Rosso'],
  ['castel del monte', 'Castel del Monte', 'Puglia, Italia', 'Nero di Troia', 'Rosso'],
  ['salento', 'Salento IGT', 'Puglia, Italia', '', ''],
  ['\\bcir[oò]\\b', 'Cirò DOC', 'Calabria, Italia', 'Gaglioppo', 'Rosso'],
  ['etna bianco', 'Etna Bianco DOC', 'Sicilia, Italia', 'Carricante', 'Bianco'],
  ['etna rosato', 'Etna Rosato DOC', 'Sicilia, Italia', 'Nerello Mascalese', 'Rosato'],
  ['\\betna\\b', 'Etna Rosso DOC', 'Sicilia, Italia', 'Nerello Mascalese, Nerello Cappuccio', 'Rosso'],
  ['cerasuolo di vittoria', 'Cerasuolo di Vittoria DOCG', 'Sicilia, Italia', "Nero d'Avola, Frappato", 'Rosso'],
  ['marsala', 'Marsala DOC', 'Sicilia, Italia', 'Grillo, Catarratto, Inzolia', 'Fortificato'],
  ['pantelleria', 'Passito di Pantelleria DOC', 'Sicilia, Italia', 'Zibibbo (Moscato di Alessandria)', 'Dolce / passito'],
  ['sicilia', 'Sicilia DOC', 'Sicilia, Italia', '', ''],
  ['vermentino di gallura', 'Vermentino di Gallura DOCG', 'Sardegna, Italia', 'Vermentino', 'Bianco'],
  ['vermentino di sardegna', 'Vermentino di Sardegna DOC', 'Sardegna, Italia', 'Vermentino', 'Bianco'],
  ['cannonau', 'Cannonau di Sardegna DOC', 'Sardegna, Italia', 'Cannonau', 'Rosso'],
  ['carignano del sulcis', 'Carignano del Sulcis DOC', 'Sardegna, Italia', 'Carignano', 'Rosso'],
  ['sardegna', 'Sardegna', 'Sardegna, Italia', '', ''],
  // Estero
  ['champagne', 'Champagne AOC', 'Champagne, Francia', 'Chardonnay, Pinot Noir, Pinot Meunier', 'Bollicine'],
  ['cr[eé]mant', 'Crémant', 'Francia', '', 'Bollicine'],
  ['chablis', 'Chablis AOC', 'Borgogna, Francia', 'Chardonnay', 'Bianco'],
  ['ch[aâ]teauneuf', 'Châteauneuf-du-Pape AOC', 'Rodano, Francia', 'Grenache, Syrah, Mourvèdre', 'Rosso'],
  ['c[oô]tes du rh[oô]ne', 'Côtes du Rhône AOC', 'Rodano, Francia', 'Grenache, Syrah', 'Rosso'],
  ['sancerre', 'Sancerre AOC', 'Loira, Francia', 'Sauvignon Blanc', 'Bianco'],
  ['beaujolais', 'Beaujolais AOC', 'Borgogna, Francia', 'Gamay', 'Rosso'],
  ['saint.?[eé]milion|pomerol', 'Saint-Émilion / Pomerol', 'Bordeaux, Francia', 'Merlot, Cabernet Franc', 'Rosso'],
  ['pauillac|margaux|m[eé]doc|saint.?julien|pessac', 'Médoc', 'Bordeaux, Francia', 'Cabernet Sauvignon, Merlot', 'Rosso'],
  ['bordeaux', 'Bordeaux AOC', 'Bordeaux, Francia', 'Merlot, Cabernet Sauvignon', ''],
  ['bourgogne|burgundy', 'Bourgogne AOC', 'Borgogna, Francia', 'Pinot Noir / Chardonnay', ''],
  ['alsace', 'Alsace AOC', 'Alsazia, Francia', '', ''],
  ['rioja', 'Rioja DOCa', 'La Rioja, Spagna', 'Tempranillo', 'Rosso'],
  ['ribera del duero', 'Ribera del Duero DO', 'Castilla y León, Spagna', 'Tempranillo', 'Rosso'],
  ['priorat', 'Priorat DOQ', 'Catalogna, Spagna', 'Garnacha, Cariñena', 'Rosso'],
  ['\\bcava\\b', 'Cava DO', 'Spagna', 'Macabeo, Xarel·lo, Parellada', 'Bollicine'],
  ['r[ií]as baixas|albari[nñ]o', 'Rías Baixas DO', 'Galizia, Spagna', 'Albariño', 'Bianco'],
  ['\\bporto\\b|\\bport wine|\\bport\\b', 'Porto DOC', 'Douro, Portogallo', 'Touriga Nacional e altri', 'Fortificato'],
  ['douro', 'Douro DOC', 'Portogallo', '', ''],
  ['mosel', 'Mosel', 'Germania', 'Riesling', 'Bianco'],
  ['tokaj', 'Tokaji', 'Ungheria', 'Furmint', 'Dolce / passito'],
].map(([re, den, region, grape, type]) => ({ re: new RegExp(re, 'i'), den, region, grape, type }));

export const VITIGNI = [
  'Nebbiolo', 'Barbera', 'Dolcetto', 'Arneis', 'Cortese', 'Moscato', 'Brachetto', 'Grignolino', 'Freisa', 'Ruchè',
  'Erbaluce', 'Timorasso', 'Pelaverga', 'Nascetta', 'Favorita', 'Croatina', 'Vespolina', 'Uva rara', 'Avanà', 'Doux d\'Henry',
  'Sangiovese', 'Montepulciano', 'Trebbiano', 'Malvasia', 'Vermentino', 'Canaiolo', 'Ciliegiolo', 'Colorino', 'Vernaccia',
  'Sagrantino', 'Grechetto', 'Verdicchio', 'Pecorino', 'Passerina', 'Lacrima', 'Cesanese',
  'Aglianico', 'Fiano', 'Greco', 'Falanghina', 'Piedirosso', 'Primitivo', 'Negroamaro', 'Nero di Troia', 'Susumaniello', 'Bombino',
  'Gaglioppo', 'Nero d\'Avola', 'Nerello Mascalese', 'Nerello Cappuccio', 'Frappato', 'Carricante', 'Grillo', 'Catarratto', 'Inzolia', 'Zibibbo',
  'Cannonau', 'Carignano', 'Monica', 'Nuragus', 'Bovale',
  'Corvina', 'Corvinone', 'Rondinella', 'Molinara', 'Garganega', 'Glera', 'Turbiana', 'Raboso',
  'Teroldego', 'Marzemino', 'Lagrein', 'Schiava', 'Gewürztraminer', 'Müller Thurgau', 'Kerner', 'Sylvaner',
  'Ribolla Gialla', 'Friulano', 'Refosco', 'Schioppettino', 'Pignolo', 'Verduzzo', 'Picolit', 'Lambrusco', 'Albana',
  'Cabernet Sauvignon', 'Cabernet Franc', 'Merlot', 'Pinot Nero', 'Pinot Noir', 'Pinot Grigio', 'Pinot Bianco', 'Chardonnay',
  'Sauvignon Blanc', 'Sauvignon', 'Syrah', 'Shiraz', 'Grenache', 'Garnacha', 'Tempranillo', 'Riesling', 'Viognier', 'Gamay',
  'Malbec', 'Carménère', 'Zinfandel', 'Petit Verdot', 'Albariño', 'Touriga Nacional', 'Furmint', 'Chenin Blanc', 'Sémillon',
];

const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Trova i vitigni citati nel testo. */
export function findGrapes(text) {
  const t = strip(text);
  const found = [];
  for (const v of VITIGNI) {
    const k = strip(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^a-z])${k}([^a-z]|$)`).test(t)) found.push(v);
  }
  // Scarta i nomi contenuti in uno più lungo (es. "Sauvignon" dentro "Cabernet Sauvignon").
  return found.filter(v => !found.some(o => o !== v && strip(o).includes(strip(v))));
}

/** Trova la denominazione più specifica nel testo. */
export function findDenominazione(text) {
  for (const d of DENOMINAZIONI) if (d.re.test(text)) return d;
  return null;
}

/** Tipologia dedotta da parole chiave. */
export function guessType(text, categoriesTags = []) {
  const tags = categoriesTags.join(' ');
  const t = strip(text + ' ' + tags);
  if (/sparkling|spumante|metodo classico|brut|pas dose|frizzante|champagne|prosecco|cremant|\bcava\b/.test(t)) return 'Bollicine';
  if (/fortified|porto|marsala|sherry|madeira|liquoroso/.test(t)) return 'Fortificato';
  if (/dessert-wine|sweet-wine|passito|vendemmia tardiva|late harvest|muffato|\bvin santo/.test(t)) return 'Dolce / passito';
  if (/rose-wine|rosato|\brose\b|chiaretto|cerasuolo d.?abruzzo/.test(t)) return 'Rosato';
  if (/white-wine|\bbianco\b|\bblanc\b|\bweiss/.test(t)) return 'Bianco';
  if (/red-wine|\brosso\b|\brouge\b|\btinto\b/.test(t)) return 'Rosso';
  return '';
}

/** Annata: un anno plausibile (1950 - anno corrente) nel testo. */
export function findVintage(text) {
  const now = new Date().getFullYear();
  const m = (text || '').match(/\b(19[5-9]\d|20[0-4]\d)\b/g);
  if (!m) return '';
  const years = m.map(Number).filter(y => y <= now);
  return years.length ? String(years[0]) : '';
}

// Prefissi GS1 -> paese in cui è registrato il codice (di solito il paese del produttore).
const GS1 = [
  [0, 139, 'Stati Uniti/Canada'], [300, 379, 'Francia'], [380, 380, 'Bulgaria'], [383, 383, 'Slovenia'], [385, 385, 'Croazia'],
  [400, 440, 'Germania'], [490, 499, 'Giappone'], [500, 509, 'Regno Unito'], [520, 521, 'Grecia'], [529, 529, 'Cipro'],
  [539, 539, 'Irlanda'], [540, 549, 'Belgio/Lussemburgo'], [560, 560, 'Portogallo'], [570, 579, 'Danimarca'], [590, 590, 'Polonia'],
  [594, 594, 'Romania'], [599, 599, 'Ungheria'], [600, 601, 'Sudafrica'], [640, 649, 'Finlandia'], [690, 699, 'Cina'],
  [729, 729, 'Israele'], [730, 739, 'Svezia'], [750, 750, 'Messico'], [760, 769, 'Svizzera'], [773, 773, 'Uruguay'],
  [778, 779, 'Argentina'], [780, 780, 'Cile'], [789, 790, 'Brasile'], [800, 839, 'Italia'], [840, 849, 'Spagna'],
  [858, 858, 'Slovacchia'], [859, 859, 'Repubblica Ceca'], [860, 860, 'Serbia'], [868, 869, 'Turchia'], [870, 879, 'Paesi Bassi'],
  [900, 919, 'Austria'], [930, 939, 'Australia'], [940, 949, 'Nuova Zelanda'],
];

export function countryFromBarcode(code) {
  if (!code) return '';
  const c = code.length === 12 ? '0' + code : code;
  if (c.length !== 13) return '';
  const p = Number(c.slice(0, 3));
  const hit = GS1.find(([a, b]) => p >= a && p <= b);
  return hit ? hit[2] : '';
}
