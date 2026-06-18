# to the world - Product Context

## Registre

product

## Etat Reel Du Projet

`to the world` est maintenant un MVP en construction active : l'interface principale existe, le backend FastAPI existe, et un premier pipeline OSINT peut synchroniser des sources publiques vers l'API locale.

Le projet n'est pas encore un produit final en production. La partie la plus avancee est l'experience frontend. La partie OSINT fonctionne comme socle applicatif, mais elle reste encore a fiabiliser avec persistance, planification automatique et verification de donnees reelles.

## Objectif Produit

Construire un centre prive de veille, lecture, scoring et candidature pour les opportunites internationales financees :

- bourses d'etudes ;
- stages payes ;
- fellowships ;
- emplois internationaux ;
- formations financees ;
- volontariat ou mission humanitaire avec prise en charge concrete.

Le produit doit transformer des pages publiques dispersees en fiches decisionnelles claires : ignorer, analyser, prioriser, sauvegarder, postuler ou archiver.

## Utilisateur Principal

Kreesten-Eddy Agboton, 20 ans, etudiant L3 Systemes Informatiques et Logiciels a Cotonou, Benin.

Priorites :

- informatique, logiciel, cybersecurite, data, IA et transformation digitale ;
- opportunites ouvertes au Benin, a l'Afrique ou au monde ;
- financement complet ou partiel ;
- absence de frais de candidature ;
- lien officiel de candidature disponible ;
- conditions, avantages et documents lisibles rapidement.

## Ce Qui Existe Aujourd'hui

Frontend :

- page `/opportunities` avec hero editorial, filtres compacts, recherche, cartes bento et drawer de detail au clic ;
- page `/pipeline` pour visualiser les opportunites par etape de candidature ;
- page `/saved` pour afficher les opportunites sauvegardees cote interface ;
- page `/sources` pour enregistrer et collecter des sources OSINT publiques ;
- page `/settings` pour afficher le profil et les preferences de veille ;
- page `/opportunities/[id]` pour ouvrir une fiche directe depuis l'API.

Backend :

- FastAPI avec routes versionnees `/api/v1` ;
- endpoints opportunites : liste, detail, mise a jour de statut ;
- endpoints sources : registre, creation, collecte manuelle, runs de collecte, sync globale ;
- pipeline OSINT avec collecteurs dedies pour ReliefWeb, UN Talent RSS et Opportunities For Youth ;
- extracteur generique HTML/RSS/JSON pour les sources publiques simples ;
- scoring, deduplication de base et journal des runs de collecte ;
- models SQLAlchemy, configuration PostgreSQL/Redis et Docker Compose prepares.

## Sources OSINT Initiales

Les sources seed actuellement integrees au backend sont :

- ReliefWeb ICT Jobs via API publique ;
- UN Talent RSS ;
- Opportunities For Youth via collecteur HTML.

L'objectif est d'ajouter ensuite les sites que l'utilisateur choisit, puis de leur associer soit un adaptateur dedie, soit l'extracteur generique.

## Contraintes Dures

- budget zero par defaut ;
- pas de dependance payante obligatoire ;
- sources publiques uniquement ;
- pas de contournement de protections ;
- frequence de collecte raisonnable pour ne pas surcharger les sites ;
- pas de secrets hardcodes ;
- l'ambiguite de financement ou de deadline doit rester visible ;
- toute candidature doit conserver son lien officiel.

## Limites Actuelles

- les opportunites et sources sont encore stockees en memoire dans les services applicatifs ;
- PostgreSQL et Redis sont prepares mais pas encore branches comme stockage metier principal ;
- le scheduler APScheduler existe, mais il n'est pas encore demarre dans le cycle de vie FastAPI ;
- Telegram est implemente comme notifier, mais le digest n'est pas encore branche a une execution automatique active ;
- les sauvegardes frontend sont locales a l'ecran et ne sont pas persistantes ;
- les changements de statut sont supportes cote API, mais pas encore exploites partout dans l'interface ;
- la qualite d'extraction depend fortement du format public de chaque site ;
- l'environnement Docker local a montre une erreur Docker Desktop/engine lors du pull Postgres, donc l'integration Docker reste a revalider.

## Ce Qui Reste A Faire Exactement

1. Stabiliser l'environnement local : Docker Desktop ou Python local doit permettre d'executer le backend et les tests.
2. Brancher les services metier sur PostgreSQL au lieu de la memoire.
3. Demarrer le scheduler automatiquement au lancement FastAPI.
4. Relier le digest Telegram ou email aux opportunites prioritaires.
5. Persister les sauvegardes et les statuts de candidature.
6. Ameliorer les collecteurs : detail pages, deadlines, financement, documents, pays et eligibilite.
7. Ajouter une couche de validation avant publication automatique.
8. Ajouter authentification/securite si l'app sort du contexte local prive.
9. Revalider build frontend, tests backend et sync reelle avec reseau disponible.

## Definition De Succes

Le produit est considere utile quand :

- une opportunite peut etre comprise en moins de 30 secondes ;
- les informations critiques sont visibles : financement, deadline, eligibilite, documents, lien officiel ;
- la page principale affiche de vraies donnees OSINT sans mock visible ;
- les doublons et offres expirees ne polluent pas la veille ;
- l'utilisateur recoit automatiquement les nouvelles opportunites prioritaires ;
- une candidature peut etre suivie de la decouverte jusqu'au resultat.
