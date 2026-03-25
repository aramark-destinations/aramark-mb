# Solution Design Overview

## Executive Summary

Modernize the Aramark Destinations digital platform by implementing Adobe Experience Manager (AEM) with Edge Delivery Services (EDS). The goal is a unified, intuitive authoring experience with significantly improved site performance, scalability, and development velocity across all managed properties.

Key pillars:
- AEM Universal Editor for in-context editing
- High-performance CDN-backed architecture (Fastly)
- Standardized content architecture with reusable blocks
- Extensible template system for current and future needs
- Strict alignment with Adobe best practices

## Project Context

Aramark Destinations operates vacation and recreation properties across national parks, lakes, and remote locations. Currently supported by 30+ property websites built on Milestone CMS. Current pain points:
- Slow-loading sites
- Difficult to update (heavily developer-dependent)
- No reusable templates or centralized asset management

The implementation replatforms all property sites onto AEM EDS to improve speed, simplify authoring, and accelerate new destination rollouts. Assets are consolidated under AEM Assets for brand governance.

## Architecture

### High-Level
- Multiple data sources (analytics, Snowflake, Revinate, Springer-Miller, FlyBook, FareHarbor) feed into Adobe Experience Platform (AEP)
- AEM + EDS power authoring, preview, and publishing
- Fastly-based CDN for high-performance delivery
- AEP applications (CJA, Real-Time CDP) provide analytics and audiences
- Adobe Target enables testing and personalization
- Adobe LLM Optimizer bridges content and AI engine interpretation

### EDS Architecture
- Content authored in AEM via Universal Editor
- Assets managed through AEM Assets
- Deployed through EDS to globally distributed edge layer
- Multi-layer: unified content governance, reusable block-based authoring, centralized asset management, edge-optimized delivery

## Technology Stack

### Adobe Licenses
- **AEM Sites with Edge Delivery Services** — page composition, authoring, delivery
- **AEM Assets (Ultimate) + Dynamic Media (Ultimate)** — unified asset library, optimized media delivery
- **Real-Time CDP (Prime B2C) + Data Distiller v2** — customer data unification, real-time segments
- **Customer Journey Analytics (Prime)** — cross-channel insights
- **Adobe Target (Premium)** — personalization and experimentation
- **Adobe LLM Optimizer** — metadata enrichment, AI workflows

### Third-Party Integrations

| Integration | Purpose |
|---|---|
| **OneTrust** | Cookie consent, privacy preferences, compliance. Global header integration. Environment-specific consent groups for dev/stage. |
| **HotJar** | On-page feedback (surveys, feedback widgets). Async loading. Separate workspace configs per environment. |
| **Elastic Search** | Site search across all properties. Indexes EDS-generated HTML/JSON and AEM Assets metadata. Multi-field search with typo-tolerance, faceted filtering, autocomplete. Separate indices per environment. |
| **Fleeknote** | On-site engagement widgets (newsletter sign-ups, promotional callouts). Consent-aware via OneTrust. Environment-specific workspace IDs. |
| **YouTube** | Embedded video player via block-based configuration. Responsive, lightweight iframe embed. Supports optional parameters (autoplay, controls). |
| **Emplifi** | Social proof — embedded social posts, UGC galleries, live social feeds. Block-driven configuration with embed/playlist/feed IDs. |
| **Google Maps** | Interactive location maps with POIs. Both simple embed (Embed block) and complex maps with custom POIs (Interactive Map custom block using Google Maps API). |
| **Chatbot(s)** | Automated customer assistance. Simple configuration block to enable/disable per page/property. Async script loading. |

## Content Architecture

### DAM Hierarchy
All assets stored under `/content/dam/aramark/`. Centralized, predictable structure supporting scalability across property sites.

### Navigation Structure
Consistent user journeys across all brands with property-specific variations where needed. Still evolving as Lake Powell pilot is implemented.

## Template System

### Editable Templates
Templates use AEM's Editable Templates with Universal Editor. Template authors can create/manage templates from defined template types without additional development. Restricted to specific author groups/roles.

Template layers:
- **Structure** — Components that cannot be moved or deleted (e.g., header, footer)
- **Initial Content** — Pre-populated content that page authors can edit, rearrange, or remove
- **Variations** — Copies of templates with different Structure or Initial Content

### Template Types

| Template | Structure | Initial Content | Notes |
|---|---|---|---|
| **Home Page** | Header XF, Booking Hero, Footer XF | Carousels (Special Offers, Featured Options, Activities, Side-by-Side, Blogs) | |
| **Section Main Page** | Header XF, Standard Hero, Footer XF | Carousels, Cards, Video, FAQ Accordion | Multiple variations expected |
| **Product Listing Pages** | Header XF, Standard Hero, Footer XF | Compare tools, Carousels, Menus, Amenities, Gallery, Cards, Maps, Video, Table, FAQ Accordion | Two primary variations: with/without Compare Tool |
| **Product Detail Pages** | Header XF, Product Details, Related Products, Footer XF | Carousels, Menus, Amenities, Gallery, Cards, Maps, Video, Table, FAQ Accordion | Variations: Activity/Rental, Dining, Lodging, Houseboat, Service, Campground/RV |
| **Fragment Structured Pages** | Header XF, Fragment, Footer XF | None (driven by Content Fragment data) | Blog Posts, Event Details, Specials & Promotions |
| **Content Page** | Header XF, Footer XF | Simple Hero (removable) | Generic template for unstructured pages (search results, privacy policy) |

### Experience Fragments
Single base XF template with site clientlibs. Used for header and footer across all pages.

## Code & Deployment Architecture

### Repository
- Single shared repository: `blueacorninc/aramark-mb` (EDS root: `/eds`)
- All properties share the same core block library
- Brand differences handled through tokens, not custom code

### Branch-to-Environment Mapping
- `main` → Production (`https://main--aramark-mb--blueacorninc.aem.live/`)
- `staging` → Staging (`https://staging--aramark-mb--blueacorninc.aem.page/`)
- Feature branches → Preview (`https://{branch}--aramark-mb--blueacorninc.aem.page/`)

Branch naming convention: ADO ticket number + change type (e.g., `ADO-94-feat`)

### Content Mountpoints
| URL Path | AEM Content Root |
|---|---|
| `/` | `/content/aramark-mb` |
| `/brands/lake-powell` | `/content/lake-powell` |
| `/brands/travel-yosemite` | `/content/travel-yosemite` |

Each new brand requires a corresponding mountpoint entry (no new repo or fork needed).

## Property Sites (30+ domains)

Pilot site: `lakepowell.com`

All other properties will be consolidated and replatformed. Domains grouped together will be consolidated under a single domain.
