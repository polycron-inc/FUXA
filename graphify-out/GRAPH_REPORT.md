# Graph Report - .  (2026-05-01)

## Corpus Check
- 5 files · ~6,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 10 nodes · 9 edges · 3 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_FMS Context|FMS Context]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]

## God Nodes (most connected - your core abstractions)
1. `FUXA/compose.yml (port 1881)` - 5 edges
2. `FUXA fork (polycron-inc/FUXA)` - 3 edges
3. `SCADA / HMI engine for FMS` - 2 edges
4. `upstream frangoteam/FUXA` - 1 edges
5. `.github/workflows/ghcr-publish (FMS-specific)` - 1 edges
6. `fms-frontend fuxaClient (no auth signing)` - 1 edges
7. `Divergence makes upstream sync harder` - 1 edges
8. `appdata/db/logs are runtime volumes (gitignored)` - 1 edges
9. `healthcheck via GET /api/settings` - 1 edges

## Surprising Connections (you probably didn't know these)
- `fms-frontend fuxaClient (no auth signing)` --references--> `FUXA/compose.yml (port 1881)`  [EXTRACTED]
  ../fms-frontend/src/api/createApiClient.ts → compose.yml
- `FUXA/compose.yml (port 1881)` --implements--> `SCADA / HMI engine for FMS`  [EXTRACTED]
  compose.yml → CLAUDE.md
- `appdata/db/logs are runtime volumes (gitignored)` --rationale_for--> `FUXA/compose.yml (port 1881)`  [EXTRACTED]
  CLAUDE.md → compose.yml

## Communities

### Community 0 - "FMS Context"
Cohesion: 0.5
Nodes (4): Divergence makes upstream sync harder, SCADA / HMI engine for FMS, FUXA fork (polycron-inc/FUXA), upstream frangoteam/FUXA

### Community 1 - "Community 1"
Cohesion: 0.5
Nodes (4): appdata/db/logs are runtime volumes (gitignored), healthcheck via GET /api/settings, FUXA/compose.yml (port 1881), fms-frontend fuxaClient (no auth signing)

### Community 2 - "Community 2"
Cohesion: 1.0
Nodes (2): FUXA/Dockerfile, .github/workflows/ghcr-publish (FMS-specific)

## Knowledge Gaps
- **6 isolated node(s):** `upstream frangoteam/FUXA`, `.github/workflows/ghcr-publish (FMS-specific)`, `fms-frontend fuxaClient (no auth signing)`, `Divergence makes upstream sync harder`, `appdata/db/logs are runtime volumes (gitignored)` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (2 nodes): `FUXA/Dockerfile`, `.github/workflows/ghcr-publish (FMS-specific)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FUXA/compose.yml (port 1881)` connect `Community 1` to `FMS Context`, `Community 2`?**
  _High betweenness centrality (0.806) - this node is a cross-community bridge._
- **Why does `SCADA / HMI engine for FMS` connect `FMS Context` to `Community 1`?**
  _High betweenness centrality (0.500) - this node is a cross-community bridge._
- **What connects `upstream frangoteam/FUXA`, `.github/workflows/ghcr-publish (FMS-specific)`, `fms-frontend fuxaClient (no auth signing)` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._