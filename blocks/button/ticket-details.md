Block Overview

The Buttons block should be set up in the EDS codebase with the needed configuration fields in Universal Editor.
The Button block should be able to be:
Used as a stand-alone block and added to Sections, Columns, Tabs, and Accordions
Included in other components like Hero and Cards
Author Experience - Block Configurability

The Button block should allow the author to configure one or more separate button elements
Dialog
The Button block dialog should present a multi-fieldSET to enable the author to configure one or more separate buttons
The Multi-Fieldset should allow the author to click an "Add" button which adds an entire button fieldset to the dialog below any that already exist.
When the author has created multiple button fieldsets, the author is able to reorder them
The Button Fieldset is comprised of the below fields.
"Button Link" - (can change the existing "Link" field)
if "Link" path field for pages starting at site root (not locked, can navigate to other sites)
if "Download" path field for Assets, starting at DAM property root (not locked, can navigate to other sites)
if "Trigger Modal" fragment reference field
"Button Text" - (can update the existing "Text" field)
"Button Screen Reader Text" - (can change the existing "Title" field)
"Button Style" Dropdown - (can change the existing "Type" field) - Options:
Filled - default
Outlined
Text-only
"Button Color" Dropdown - (NEW) - Options:
Primary Color - default
Secondary Color
Tertiary Color
Black
White
"Button Size" Dropdown - (from Figma, not in original ticket) - Options:
Large - default (56px min-height, 16px font, 8px/24px padding)
Medium (40px min-height, 14px font, 8px/16px padding)
Small (32px min-height, 12px font, 8px/12px padding)
"Button Shape" Dropdown - (from Figma, not in original ticket) - Options:
Rectangular - default (8px border-radius)
Pill (999px border-radius; horizontal padding increases per size: Large 32px, Medium 24px, Small 16px)
End User Experience - Style & Functionality

Base styling from Figma design using tokens: https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=51-125&t=jX7Rt46CIxhBfR13-4
States: https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=5374-5161&t=jX7Rt46CIxhBfR13-4
Section Theme variations: https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=8652-3304&t=jX7Rt46CIxhBfR13-4
Default Multi-button alignment:
When multiple buttons are authored, they should be presented 'inline' with each other with at least 8px between the buttons
Buttons that cannot fit inline based on the width of the container/viewport should wrap to a line under the initial
Typography (from Figma, not in original ticket):
All button text uses font-weight 700 (Bold), not 600 (Semibold)
All button text uses letter-spacing -2% (-0.02em)
All button text uses line-height 1.5
Font sizes are tied to button size: Large = 16px, Medium = 14px, Small = 12px
Button layout (from Figma, not in original ticket):
Button content (text + optional icon) is centered both horizontally and vertically (inline-flex)
Gap between icon and label text is 8px
Outlined button stroke weight is 1px (Figma spec); current implementation uses 2px — to be aligned in a follow-up