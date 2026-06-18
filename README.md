# to the world

Plateforme privee de veille OSINT pour collecter, scorer, lire, sauvegarder et suivre des opportunites internationales financees.

Le projet vise un usage personnel : aider Kreesten-Eddy Agboton a trouver des bourses, stages, fellowships, emplois, formations ou missions financees en informatique, avec lecture rapide des conditions et lien officiel de candidature.

## Etat Actuel

Le projet est au stade MVP local.

Ce qui fonctionne deja :

- frontend Next.js avec experience editorial/bento ;
- drawer de detail qui s'ouvre uniquement au clic sur une opportunite ;
- filtres, recherche, etats loading/empty/error ;
- API FastAPI avec opportunites, sources, runs et sync ;
- registre OSINT avec sources seed ;
- collecteurs ReliefWeb, UN Talent RSS et Opportunities For Youth ;
- scoring et deduplication de base ;
- Docker Compose prepare pour PostgreSQL, Redis et backend.

Ce qui n'est pas encore finalise :

- persistance metier PostgreSQL ;
- scheduler automatique actif dans FastAPI ;
- notifications Telegram automatiques ;
- sauvegardes persistantes ;
- verification Docker locale, bloquee par une erreur Docker Desktop/engine sur cette machine.

## Stack

Frontend :

- Next.js 15 ;
- React 19 ;
- TypeScript strict ;
- Tailwind CSS ;
- TanStack Query ;
- Motion ;
- icones locales via `MaterialIcon`.

Backend :

- FastAPI ;
- Pydantic ;
- HTTPX ;
- BeautifulSoup ;
- feedparser ;
- APScheduler ;
- SQLAlchemy async ;
- Redis client ;
- pytest.

Infrastructure locale :

- PostgreSQL 16 via Docker Compose ;
- Redis 7 via Docker Compose ;
- backend containerise via `backend/Dockerfile`.

## Routes Frontend

- `/opportunities` : page principale de decouverte ;
- `/opportunities/[id]` : fiche directe d'une opportunite ;
- `/pipeline` : suivi des candidatures ;
- `/saved` : opportunites sauvegardees cote interface ;
- `/sources` : gestion des sources OSINT ;
- `/settings` : profil et preferences.

La route `documents` n'est plus une surface produit active.

## API Backend

Endpoints principaux :

- `GET /health` ;
- `GET /api/v1/health` ;
- `GET /api/v1/opportunities` ;
- `GET /api/v1/opportunities/{id}` ;
- `PATCH /api/v1/opportunities/{id}/status` ;
- `GET /api/v1/sources` ;
- `POST /api/v1/sources` ;
- `POST /api/v1/sources/sync` ;
- `GET /api/v1/sources/sync/status` ;
- `GET /api/v1/sources/runs` ;
- `POST /api/v1/sources/{id}/collect`.

## Flux OSINT Actuel

1. L'utilisateur ouvre `/opportunities`.
2. Le frontend appelle `GET /api/v1/opportunities`.
3. Si aucune donnee n'est disponible, l'utilisateur lance une synchronisation.
4. Le frontend appelle `POST /api/v1/sources/sync`.
5. Le backend parcourt les sources actives.
6. Chaque source passe par un collecteur dedie ou par l'extracteur generique.
7. Le pipeline valide, deduplique, score et publie les fiches en memoire.
8. Le frontend recharge la liste des opportunites.

## Sources Seed

- ReliefWeb ICT Jobs : API publique ;
- UN Talent RSS : flux RSS ;
- Opportunities For Youth : page publique HTML.

## Lancement Local

Frontend :

```powershell
cd C:\Users\AGBOTON\bourse\frontend
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Backend avec Docker, quand Docker Desktop fonctionne :

```powershell
cd C:\Users\AGBOTON\bourse
docker.exe compose up -d --build backend
```

Backend sans Docker, si Python est disponible localement :

```powershell
cd C:\Users\AGBOTON\bourse\backend
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Le frontend utilise par defaut `http://127.0.0.1:8000`. Pour changer l'URL :

```powershell
$env:NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```

## Verification

Frontend :

```powershell
cd C:\Users\AGBOTON\bourse\frontend
npm.cmd run typecheck
npm.cmd run build
```

Backend :

```powershell
cd C:\Users\AGBOTON\bourse\backend
python -m pytest tests/ -v
```

Etat connu de verification :

- le typecheck frontend a deja ete execute avec succes apres le cablage API ;
- le build frontend doit etre relance apres stabilisation de l'environnement local ;
- les tests backend doivent etre relances quand Python ou Docker est disponible ;
- Docker Compose a echoue sur cette machine avec une erreur Docker Desktop/engine pendant l'acces a l'image `postgres:16-alpine`.

## Prochaine Etape Technique

Priorite immediate :

1. corriger l'environnement Docker/Python local ;
2. lancer une sync OSINT reelle ;
3. verifier que les opportunites remontees s'affichent dans `/opportunities` ;
4. brancher PostgreSQL pour ne plus perdre les donnees au redemarrage ;
5. activer le scheduler quotidien et les alertes.
