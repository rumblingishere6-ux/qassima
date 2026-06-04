// Database of fake cars
const fakeCars = {
  "1234 ع 99": { marque: "Renault", modele: "Symbol", annee: "2020", carburant: "Essence" },
  "5678 و 22": { marque: "Hyundai", modele: "i10", annee: "2022", carburant: "Essence" },
  "9101 ب 33": { marque: "Dacia", modele: "Sandero", annee: "2019", carburant: "Diesel" },
  "1112 ج 44": { marque: "Peugeot", modele: "208", annee: "2021", carburant: "Essence" }
};

export default (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plaque } = req.body;

    if (!plaque || typeof plaque !== 'string') {
      return res.status(400).json({ error: 'Invalid plaque' });
    }

    console.log(`[SEARCH] Searching for plaque: ${plaque}`);

    const car = fakeCars[plaque.trim()];

    if (car) {
      console.log(`[SEARCH] Car found: ${JSON.stringify(car)}`);
      return res.status(200).json({
        success: true,
        found: true,
        plaque: plaque.trim(),
        ...car
      });
    } else {
      console.log(`[SEARCH] Car not found for plaque: ${plaque}`);
      return res.status(200).json({
        success: true,
        found: false,
        plaque: plaque.trim()
      });
    }

  } catch (error) {
    console.error('[SEARCH ERROR]', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};