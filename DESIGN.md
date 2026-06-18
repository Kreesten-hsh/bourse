# to the world - Design System

## Positionnement Design

`to the world` doit ressembler a un centre de decision editorial pour la mobilite internationale, pas a un dashboard SaaS generique.

La direction actuelle est : calme, premium, academique, Swiss/bento, avec une lecture rapide des opportunites et un drawer de detail qui donne la sensation d'une fiche soigneusement editee.

## Etat Reel De L'Interface

L'interface actuelle utilise :

- une navbar sombre avec effet glass controle ;
- une page principale `/opportunities` centree sur un hero editorial ;
- une ligne unique de filtres compacts avec recherche a droite ;
- des cartes opportunites en grille bento ;
- un drawer lateral droit qui s'ouvre uniquement au clic sur une carte ;
- une feuille quasi plein ecran sur mobile pour le detail ;
- une page `/pipeline` orientee parcours de candidature ;
- une page `/sources` pour l'outil OSINT ;
- une page `/saved` pour les opportunites gardees sous la main.

## Composition Produit

La page principale suit cette structure :

1. hero minimal avec promesse de mobilite ;
2. indicateurs discrets : opportunites actives et financements detectes ;
3. filtres sur une seule ligne ;
4. recherche integree a droite de la meme ligne ;
5. grille bento de cartes ;
6. drawer de lecture au clic ;
7. footer discret.

La logique `sidebar + tableau + inspecteur permanent` est abandonnee.

## Drawer De Detail

Le detail d'une opportunite est la zone critique du produit.

Etat attendu :

- masque par defaut ;
- ouvert uniquement au clic sur une carte ;
- scrim sombre derriere le drawer ;
- fermeture par bouton, clic backdrop et Escape ;
- header compact pour laisser la place au corps ;
- ordre de lecture clair : titre, organisation, action, attention, avantages, documents, conditions, analyse personnalisee ;
- actions finales limitees a `Postuler` et `Sauvegarder`.

Elements retires volontairement :

- score explique dans le drawer ;
- selecteur de statut en bas du drawer ;
- bouton `Preparer le dossier` ;
- bloc de metadonnees redondant sous l'organisation.

## Couleurs

Palette historique :

- Royal Blue : `#3447AA` ;
- Powder Pink : `#FBEAEB`.

Palette appliquee dans l'interface actuelle :

- surface dominante : blanc chaud / rose tres leger ;
- texte principal : bleu nuit `#03192e` ;
- navbar : bleu nuit semi-transparent avec blur ;
- actions et focus : bleu royal / bleu institutionnel ;
- rose : atmosphere de fond, jamais decoration lourde ;
- vert, ambre et rouge : uniquement pour etats semantiques.

Le blanc doit dominer. Le bleu guide. Le rose respire.

## Typographie

La typographie actuelle utilise une pile systeme moderne :

- display : `Aptos Display`, `Segoe UI Variable Display`, `SF Pro Display`, `Inter`, system-ui ;
- texte : `Aptos`, `Segoe UI Variable Text`, `SF Pro Text`, `Inter`, system-ui ;
- mono : `Cascadia Mono`, `JetBrains Mono`, `SFMono-Regular`, `Consolas`.

Regles :

- les titres portent l'identite ;
- les metadonnees restent discretes ;
- pas de type fluide base sur la largeur viewport ;
- pas de surenchere de badges ;
- les fiches doivent rester lisibles en moins de quelques secondes.

## Iconographie

L'app utilise actuellement `MaterialIcon`, un wrapper SVG local.

Regles :

- une seule famille visuelle ;
- trait fin et coherent ;
- icones utiles a la lecture : source, pays, deadline, financement, sauvegarde, candidature, statut ;
- l'icone profil dans la navbar remplace l'engrenage pour les parametres.

## Cartes Opportunites

Les cartes doivent rester :

- blanches ;
- bordure fine ;
- shadow legere par defaut ;
- shadow plus visible au hover ;
- leger lift vertical au hover ;
- contenu limite a l'essentiel ;
- titre fort, metadonnees sobres, CTA discret.

Une carte selectionnee doit gagner en presence sans glow, sans neon et sans effet decoratif lourd.

## Etats UI

Etats presents ou attendus :

- loading skeleton, pas de spinner central ;
- empty state OSINT avec action de synchronisation ;
- erreur API visible mais discrete ;
- drawer ferme par defaut ;
- mobile adapte au plein ecran ;
- focus visible pour les elements interactifs.

## Motion

Motion sobre et fonctionnelle :

- transitions courtes ;
- transform + opacity ;
- lift sur cartes ;
- drawer en translation horizontale ;
- feedback immediat au clic ;
- pas d'animation idle permanente ;
- pas de glow ;
- pas de gradient anime.

## Pages Support

`/pipeline` doit rester plus editorial que kanban industriel.

`/sources` doit assumer son role OSINT : registre des sources, creation, collecte manuelle et statut de source.

`/saved` est utile, mais doit devenir persistant pour etre un vrai espace personnel.

`/settings` contient le profil et les preferences de score/notification.

## Dette Design Actuelle

- La page detail directe `/opportunities/[id]` est fonctionnelle, mais moins premium que le drawer.
- Les pages support doivent encore recevoir le meme niveau de finition visuelle que `/opportunities`.
- Les sauvegardes ne sont pas persistantes, donc l'experience `/saved` reste partielle.
- Une verification responsive par captures desktop/mobile doit etre refaite apres stabilisation du serveur local.

## Interdits

- tableau HTML classique pour les opportunites ;
- dashboard KPI ;
- admin panel ;
- hero marketing IA generique ;
- glassmorphism partout ;
- gradients flashy ;
- icones melangees ;
- score ou metriques qui prennent plus de place que le contenu utile.
