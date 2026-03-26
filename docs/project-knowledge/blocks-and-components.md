# Blocks & Components

Components are developed for authoring with Universal Editor and display handled by Edge Delivery Services. The solution implements all (or almost all) Boilerplate and Block Collection EDS Blocks, plus custom blocks for additional requirements.

## Component Inventory

### Boilerplate Blocks
| Block | Category |
|---|---|
| Headings | Boilerplate |
| Text | Boilerplate |
| Images | Boilerplate |
| Lists | Boilerplate |
| Buttons | Boilerplate |
| Sections | Boilerplate |
| Icons | Boilerplate |
| Hero | Boilerplate |
| Columns | Boilerplate |
| Cards | Boilerplate |
| Header | Boilerplate |
| Footer | Boilerplate |

### Block Collection Blocks
| Block | Category |
|---|---|
| Embed | Block Collection |
| Fragment | Block Collection |
| Table | Block Collection |
| Video | Block Collection |
| Accordion | Block Collection |
| Breadcrumbs | Block Collection |
| Carousel | Block Collection |
| Modal | Block Collection |
| Quote | Block Collection |
| Search | Block Collection |
| Tabs | Block Collection |

### Custom Blocks
| Block | Category |
|---|---|
| Forms | Custom |
| Compare Tool | Custom |
| Booking | Custom |
| Interactive Map (Google) | Custom |
| PDF Embed | Custom |
| Video Hero | Custom |
| Media Gallery | Custom |

---

## Component Details

### Headings
- **Use case**: All pages, standalone or within other components
- **Design**: Configurable heading text and level (H1-H4). No need for levels below H4 in standalone.

### Text
- **Use case**: All pages, standalone or within other components
- **Design**: Uses Universal Editor Text component. No known route to enhance or modify.

### Images
- **Use cases**: Featured images for Product/Blog/Event/Specials detail pages; images within cards/galleries; standalone images
- **Design**: Primary use is inclusion in other components (cards, carousels, gallery). For standalone: configurable fields for image selection, alt text, and optional link.

### Lists
- **Use case**: Ordered or unordered lists in content
- **Design**: Authors can create ordered/unordered lists. Since lists are *default content*, may be covered by the Text component rather than standalone.

### Buttons
- **Use case**: Call-to-action buttons on any page
- **Design**: Configurable button style, size, text, link/path, link description text, and behavior. Behavior options: open in same tab, new tab, or as modal. Modal behavior uses link/path pointing to an Experience Fragment.

### Sections
- **Use case**: Container blocks for all content on pages
- **Design**: Configurable coverage styles (Full-width, Contained, Full-bleed), background (image, color, video), and Theme (Dark, Light, Light 2, Brand).

### Icons
- **Use cases**: Icons with text labels (e.g., Amenities module); icons before/after text content (e.g., button with icon)
- **Design**: Select icon + text label. Also supports block reference token method: author enters `:<iconname>:` in a text field, frontend replaces with graphical icon at render.

### Hero
- **Use case**: Top page heading and top-level information for landing pages
- **Design**: Primary configs: background (image, color, video), H1 heading text. Optional: eyebrow text, description text, CTA buttons, breadcrumb.

### Columns
- **Use case**: Two to four columns in a section for content layout
- **Design**: Divide sections into 2, 3, or 4 equal-width columns. Responsive — stacks vertically at mobile widths.

### Cards
- **Use cases**: Manually authored cards (in section, columns, tabs, carousel, accordion); dynamically populated cards (carousels, compare tools, search results)
- **Design**: Base card fields: eyebrow text, title, description, image, up to two CTAs. Also populated dynamically from Content Fragments with matching fields.

### Header
- **Use case**: Global site header
- **Design**: Site logo, main menu with mega menu panels, search bar. Two states: (1) active on page load until user scrolls past first section; (2) displayed after scroll threshold. Authors can modify main menu and sub-menu items.

### Footer
- **Use case**: Global site footer
- **Design**: Navigation links, social links, newsletter subscribe form, ownership/affiliation badges, copyright. Links/text/images configurable by authors. Subscription form submits to property-specific endpoints.

### Embed
- **Use cases**: Basic Google Map embed; live video feed embeds
- **Design**: Simple embedded Google Maps for basic needs. Complex maps use Google Maps API (see Interactive Map). Also embeds live video feeds.

### Fragment
- **Use cases**: Populating detail pages for structured content; dynamically populating Carousels/Accordions/other components with Content Fragment data
- **Design**: Leverages Content Fragments for content reused across all properties. Single fragment = single place to author each "thing." Fragment populates detail pages, dynamic cards in any carousel style, and Compare Tool.
  - Detail pages: Each CF model has a "Page Type" field tied to a specific UI template
  - Dynamic population: CF models have common card fields with identical field names across models
  - Compare Tool: CF models include common card fields + all comparable product attributes + Detail page fields

### Table
- **Use case**: Tabular data presentation
- **Design**: May leverage Block Collection table with custom UE authoring component, or fully custom. Needs: configurable table styles, multiple/apparent header rows, cell merging, small elements (buttons) in cells.

### Video
- **Use cases**: Standalone videos in page sections; within gallery/gallery carousel
- **Design**: Handles YouTube videos (YouTube player embed) and hosted videos (Dynamic Media players + streaming).

### Accordion
- **Use case**: Expand/collapse content blocks (e.g., FAQs)
- **Design**: Manually configurable panel titles and content. Also populatable from Content Fragments (possibly via custom authoring component like CF List Core Component outputting to Accordion EDS Block).

### Breadcrumbs
- **Use case**: Pages below site root/homepage
- **Design**: Dynamically populates based on site structure above any given page. Uses page Title as displayed value.

### Carousel
- **Use case**: User-advanced carousel of content on pages
- **Design**: Manual panel/slide configuration. Also populatable from Content Fragment data. Multiple end-user Styles with conceptual Roles (featuring products, promotions, experiences, blog content, etc.). Slides are either media assets or Card variants.

### Modal
- **Use cases**: Dynamic modals (rule-based, e.g., popup after page load); modals triggered from links/buttons
- **Design**: Dynamic display based on case-by-case rules. Content created as Experience Fragments. Button component's "Open in Modal" behavior uses link/path to the XF.

### Quote
- **Use case**: Quote text with appropriate markup and styling
- **Design**: Outputs author-entered text with quote markup and styling.

### Search
- **Use cases**: Header search bar; page content search (keyword search on FAQ/Blog listing pages)
- **Design**: Full site search integrated with Elastic Search. Also used for filtering on listing pages (FAQs, Blogs).

### Tabs
- **Use case**: Categorical tabs with associated content (e.g., travel info for different modes of travel)
- **Design**: Authors define tab labels and panel content. Does NOT support nested containers (no section component inside tab panels).

### Forms — Custom
- **Use cases**: Email-only subscribe forms; general contact forms; RFP forms for large event booking
- **Design**: Custom built. Each form type built for use by all property sites. May configure form endpoint or use property codes to differentiate submissions.

### Compare Tool — Custom
- **Use case**: Filterable product listing grid with ability to compare 2-4 products of same type
- **Design**: Like a commerce PLP. Filter by product attributes, select 2-4 cards, enter Compare mode showing attributes in matrix table. Data from Content Fragments with all product attribute data. Author selects CF model and which fields to use as filter options.

### Booking — Custom
- **Use cases**: Homepage hero; triggered from header second state (displays in modal)
- **Design**: Initial booking details before sending to relevant booking engine. Fields: product selection, arrival/departure dates, adults/children count. Configurable for one to many bookable products with different booking engines (Springer Miller accepts dates, FareHarbor does not). Content Fragment provides configuration referenced from any property page.
  - Multiple products: Start with product selection → show date fields based on engine support → show guest count or just enable "Check Availability"
  - Single product + dates accepted: Start with date fields → guest count
  - Single product + no dates: Just "Check Availability" button

### Interactive Google Map — Custom
- **Use case**: Area maps with custom POIs and icons
- **Design**: Custom component using Google Maps API Dynamic Maps. Supports custom Points of Interest, custom icons, starting zoom settings.

### PDF Embed — Custom
- **Use case**: Display PDF content viewable in-page (e.g., campground maps in PDF format)
- **Design**: Displays PDF directly in page content. Provides download option and open-in-new-tab for browser PDF viewer.

### Video Hero — Custom
- **Use case**: Page heroes with video backgrounds and accessible video controls
- **Design**: Short video clip (up to 30 seconds) as hero background. Hosted from AEM Assets, leverages Dynamic Media for optimization. Must have accessible video controls.

### Media Gallery — Custom
- **Use case**: Full-page gallery of image/video thumbnails, filterable by tags, with lightbox popup
- **Design**: Occupies full page. Displays thumbnails based on author-configured tags or root paths. Filterable by author-selected tag groups. Lightbox with native aspect ratio on click. Lightbox has carousel controls (next/previous) without closing.

---

## Content Fragment Models

Content Fragment models define structured data driving dynamic content. Single source of truth — author once, deliver everywhere (detail pages, cards, compare tools).

### Example: Houseboat CF Model

| Field Name | Field Type | Data Type |
|---|---|---|
| title | single line text | String |
| eyebrow | single line text | String |
| shortDescription | single line text | String |
| images | content reference (multifield) | String[] |
| button1Link | single line text | String |
| button1Text | single line text | String |
| button1Style | Enumeration (radio) | String |
| button1ThemeColor | Enumeration (radio) | String |
| button2Link | single line text | String |
| button2Text | single line text | String |
| button2Style | Enumeration (radio) | String |
| button2ThemeColor | Enumeration (radio) | String |
| longDescription | multi line text | String |
| marina | Tag | String[] |
| bedrooms | Number (integer) | Long |
| bathrooms | Number (integer) | Long |
| sleeps | Number (integer) | Long |
| maxCapacity | Number (integer) | Long |
| notesOnSleepingArrangements | multi line text | String |
| acSystem | Boolean | Boolean |
| kitchenAppliances | Boolean | Boolean |
| electricInverter | Boolean | Boolean |
| peakSeason7dayRate | Number (fraction) | Double |
| peakSeason6dayRate | Number (fraction) | Double |
| peakSeason5dayRate | Number (fraction) | Double |
| offPeakSeason7dayRate | Number (fraction) | Double |
| offPeakSeason6dayRate | Number (fraction) | Double |
| offPeakSeason5dayRate | Number (fraction) | Double |
| offPeakSeason4dayRate | Number (fraction) | Double |

Additional CF models will be created for: lodging, activities, dining, events, FAQs, specials/promotions. All follow the same principles — common card fields use identical field names across models.

## Block Naming & Governance Standards

| Aspect | Convention |
|---|---|
| Directory | `/blocks/{blockname}/` — lowercase, hyphenated |
| JavaScript | `{blockname}.js` — default export: `decorate(block)` |
| CSS | `{blockname}.css` — one per block |
| CSS classes | BEM-style (e.g., `.cards-card-image`) |
| Documentation | README required per block |
| Brand override | `/brands/{brand}/blocks/{blockname}/` (available but discouraged) |

No site-specific components — all functionality built as shared global component library. Brand differences expressed through tokens, not block overrides.
