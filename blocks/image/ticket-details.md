Block Overview 

The Image block should be set up in the EDS codebase with an equivalent Universal Editor component.
 
 
 
Author Experience - Block Configurability 

Dialog Fields 
Keep existing fields 
ADD - checkbox field under the "Alt Text" field w/ text "Get Alternative Text from DAM" 
Default: checked 
Functionality: 
when checked, the "Alt Text" field value is populated with the image metadata description AND the field is disabled (cannot edit) 
If author unchecks the checkbox, the value populated remains in place, but the field becomes editable 
 
 
 
Block Output 
Update the output so that the "Image" component outputs the Source element, alt text and data attributes the way the Card component does. 
visual example - see cards authored below hero: https://author-p179307-e1885056.adobeaemcloud.com/content/lake-powell/index/the-lake-powell-experience.html ) 
elementsImage 
 
 
 
 
 
 
 
End User Experience - Style & Functionality 

Base styling from Figma design using tokens: example stand-alone image - https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=8824-5741&t=jX7Rt46CIxhBfR13-4 
Border radii: https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=5639-24211&t=MD035u4DYzV9gwrn-4 
Theme styles 
Theme variations: n/a  
Property-Defined Theme variables: n/a 