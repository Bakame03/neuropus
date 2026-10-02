import { useEffect, useState } from 'react';

type Health =
  | { etat: 'chargement' }
  | { etat: 'ok' }
  | { etat: 'base-injoignable' }
  | { etat: 'api-injoignable' };

const MESSAGES: Record<Health['etat'], string> = {
  chargement: 'Vérification en cours…',
  ok: 'API et base de données joignables.',
  'base-injoignable': 'API joignable, mais la base de données ne répond pas.',
  'api-injoignable': 'API injoignable.',
};

async function fetchHealth(): Promise<Health> {
  try {
    const response = await fetch('/api/health');
    if (response.ok) return { etat: 'ok' };
    if (response.status === 503) return { etat: 'base-injoignable' };
    return { etat: 'api-injoignable' };
  } catch {
    return { etat: 'api-injoignable' };
  }
}

// Page provisoire du socle (INC-02) : elle ne montre que l'état de la chaîne
// front → API → base. Les vrais écrans arrivent avec INC-11.
function App() {
  const [health, setHealth] = useState<Health>({ etat: 'chargement' });

  useEffect(() => {
    let cancelled = false;
    void fetchHealth().then((h) => {
      if (!cancelled) setHealth(h);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <h1>neuropus</h1>
      <p role="status">{MESSAGES[health.etat]}</p>
    </main>
  );
}

export default App;
