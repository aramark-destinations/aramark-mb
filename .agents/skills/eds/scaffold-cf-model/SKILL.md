---
name: eds/scaffold-cf-model
description: Design and scaffold a Content Fragment model following solution design patterns. Ensures common card fields use identical names across models.
when_to_use: when creating a new Content Fragment model for a content type or reviewing an existing CF model
version: 1.0.0
---

# Scaffold Content Fragment Model

## Overview

Content Fragment models are the structured data backbone of this platform. A single CF is authored once and drives: card displays, detail pages, carousel slides, and compare tool matrices. Field naming consistency across models is critical — blocks depend on shared field names to render any CF type.

This skill walks through designing a CF model that is compatible with all consuming blocks.

**Reference model:** The Houseboat CF model fields are embedded in Step 1–5 of this skill as the canonical example.

---

## Pre-flight

- [ ] Identify the content type (e.g., lodging, activity, dining, event, FAQ, special/promotion)
- [ ] Determine which blocks will consume this model (cards, carousel, accordion, compare tool, fragment/detail page)
- [ ] Check if a similar CF model already exists — avoid duplicating field sets

---

## Step 1: Common Card Fields (MANDATORY)

Every CF model MUST include these fields with these exact names. These are the fields that cards, carousels, and other card-rendering blocks depend on. Changing these names breaks cross-model rendering.

| Field Name | Field Type | Data Type | Purpose |
|---|---|---|---|
| `title` | single line text | String | Card title, detail page heading |
| `eyebrow` | single line text | String | Category/type label above title |
| `shortDescription` | single line text | String | Card body text, preview text |
| `images` | content reference (multifield) | String[] | Card image, gallery images |
| `button1Link` | single line text | String | Primary CTA URL |
| `button1Text` | single line text | String | Primary CTA label |
| `button1Style` | Enumeration (radio) | String | Primary CTA visual style |
| `button1ThemeColor` | Enumeration (radio) | String | Primary CTA theme color |
| `button2Link` | single line text | String | Secondary CTA URL |
| `button2Text` | single line text | String | Secondary CTA label |
| `button2Style` | Enumeration (radio) | String | Secondary CTA visual style |
| `button2ThemeColor` | Enumeration (radio) | String | Secondary CTA theme color |

**Do not rename these fields.** Do not add prefixes. Do not use camelCase variants (e.g., `shortDesc` instead of `shortDescription`). Identical names across models is the design contract.

---

## Step 2: Detail Page Fields

Add fields needed for the full detail page rendering. These are content-type-specific.

### Required for all detail page models

| Field Name | Field Type | Data Type | Purpose |
|---|---|---|---|
| `longDescription` | multi line text | String | Full content body for detail page |

### Content-type-specific fields

Add fields relevant to the content type. Examples by type:

**Lodging / Houseboat:**
- `marina` (Tag, String[]) — location/marina association
- `bedrooms` (Number integer, Long)
- `bathrooms` (Number integer, Long)
- `sleeps` (Number integer, Long)
- `maxCapacity` (Number integer, Long)
- `notesOnSleepingArrangements` (multi line text, String)
- Amenity booleans: `acSystem`, `kitchenAppliances`, `electricInverter`, etc.
- Rate fields: `peakSeason7dayRate`, `offPeakSeason5dayRate`, etc. (Number fraction, Double)

**Activity / Rental:**
- `duration` (single line text, String)
- `difficulty` (Enumeration, String)
- `minAge` (Number integer, Long)
- `maxParticipants` (Number integer, Long)
- `seasonAvailability` (Tag, String[])
- `equipmentIncluded` (Boolean)
- Price fields as needed

**Dining:**
- `cuisine` (Tag, String[])
- `mealTypes` (Tag, String[]) — breakfast, lunch, dinner
- `priceRange` (Enumeration, String)
- `reservationRequired` (Boolean)
- `menuLink` (single line text, String)
- `hours` (multi line text, String)

**Event:**
- `eventDate` (Date, Calendar)
- `eventEndDate` (Date, Calendar)
- `location` (single line text, String)
- `ticketLink` (single line text, String)
- `ticketPrice` (Number fraction, Double)
- `recurring` (Boolean)

**FAQ:**
- `question` (single line text, String) — use as `title` alias or separate field
- `answer` (multi line text, String) — use as `longDescription` alias or separate field
- `category` (Tag, String[])

**Specials / Promotions:**
- `validFrom` (Date, Calendar)
- `validTo` (Date, Calendar)
- `discountType` (Enumeration, String)
- `discountValue` (single line text, String)
- `promoCode` (single line text, String)
- `termsAndConditions` (multi line text, String)

---

## Step 3: Page Type Field

If this CF model drives detail pages, include a `pageType` enumeration field that maps to a UI template.

| Field Name | Field Type | Data Type | Purpose |
|---|---|---|---|
| `pageType` | Enumeration (radio) | String | Maps to a detail page template |

**Known page types** (from solution design):
- Activity/Rental
- Dining
- Lodging
- Houseboat
- Service
- Campground/RV
- Blog Post
- Event Detail
- Special/Promotion

---

## Step 4: Compare Tool Fields (if applicable)

If products of this type will be compared in the Compare Tool, ensure:

1. All common card fields are present (Step 1) — these render the comparison cards
2. All filterable attributes are included — the author selects which fields become filter options
3. All comparable attributes are included — these populate the comparison matrix table

The Compare Tool reads the CF model's fields dynamically. It does not require a special field structure beyond having the attributes present as named fields.

**Example (Houseboat):** `bedrooms`, `bathrooms`, `sleeps`, `maxCapacity`, `acSystem`, `kitchenAppliances`, rate fields — all become comparable attributes.

---

## Step 5: Field Type Reference

Use this mapping when defining fields:

| AEM Field Type | Data Type | Use for |
|---|---|---|
| single line text | String | Short text (titles, labels, URLs, codes) |
| multi line text | String | Long text (descriptions, notes, HTML content) |
| content reference | String | Single asset reference (image, document) |
| content reference (multifield) | String[] | Multiple asset references (gallery images) |
| Number (integer) | Long | Counts, quantities, capacities |
| Number (fraction) | Double | Prices, rates, percentages |
| Boolean | Boolean | Yes/no flags (amenities, features) |
| Enumeration (radio) | String | Fixed-choice fields (styles, types, categories) |
| Tag | String[] | Taxonomy/classification (locations, categories, seasons) |
| Date | Calendar | Date/time values |

---

## Step 6: Validate

Before finalizing, check:

- [ ] All 12 common card fields from Step 1 are present with exact names
- [ ] Field names use camelCase (e.g., `shortDescription`, not `short_description`)
- [ ] No duplicate field names within the model
- [ ] `pageType` field included if model drives detail pages
- [ ] Compare-relevant attributes included if model is used in Compare Tool
- [ ] Field types match expected data types (see Step 5)
- [ ] Model follows the markdown table format shown in Step 7 of this skill

---

## Step 7: Output

Document the model as a markdown table matching the solution design format:

```markdown
### {Content Type} CF Model

| Field Name | Field Type | Data Type |
|---|---|---|
| title | single line text | String |
| eyebrow | single line text | String |
| shortDescription | single line text | String |
| images | content reference (multifield) | String[] |
| ... | ... | ... |
```

---

## Anti-Patterns

| Do NOT | Do instead |
|--------|-----------|
| Rename common card fields (`desc` instead of `shortDescription`) | Use exact field names from Step 1 |
| Use snake_case field names | Use camelCase |
| Skip the images multifield for types that "don't need galleries" | Include `images` — cards always need at least one image |
| Create separate models for minor variations of the same type | Use enumerations or tags to distinguish variants within one model |
| Hard-code page type mappings in JS | Use the `pageType` enumeration field |
| Omit button fields because "this type won't have CTAs" | Include all 8 button fields — authors decide what to populate |
