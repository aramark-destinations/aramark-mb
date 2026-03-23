Block Overview
The Video block should be able to handle both DAM-Hosted and YouTube/Vimeo hosted videos, using either the HTML5 player for DAM-hosted (streaming via Dynamic Media) or the YouTube/Vimeo embedded players depending on the Video source/type
Starting point from BA block library

Author Experience - Block Configurability
Placement
Author can add the Video Block to any Section or Container Block as a stand-alone Block
Dialog Fields
"Video Source"
type: DAM path field, should also accept a full YouTube URL
required: Yes
default: empty
field descripton: "Select MP4 from DAM or enter URL for YouTube"
"Video Type" (OPTIONS CHANGED)
type: Select Dropdown - disabled (auto-select based on 'Video Source' path)
options: "MP4 (AEM DAM or Scene7 URL)", "YouTube", "Vimeo"
required: Yes
default: "MP4 (AEM DAM or Scene7 URL)"
field description: "Video Type auto-detected from source path"
"Poster Image Override" (CHANGED)
type: path (DAM)
required: no
default: empty
field description: "Select poster image to override the default, first frame poster image"
"Video Description" (NEW)
type: text
required: no
default: empty
field description: "Text description of video content"
"Full-width Video"
type: checkbox
required: no
default: false
field description: "Expand video to full container width"
"Captions Track - MP4 source only"
type: DAM path field
required: no
default: empty
field description: "WebVTT file for MP4 video captions"
Block Logic & Output
The 'Video Type' auto-detected from 'Video Source' path, determines whether the block should output the MP4 player (Dynamic Media), YouTube player or Vimeo player
Poster image default is 'first frame' unless author has configured the "poster image override" field

End User Experience - Style & Functionality
Base styles - Note that when used stand-alone in a full content width section the Video is not the full width of the max content width - effectively has a max width of 920px according to the design. https://www.figma.com/design/sf2qQ3I3BFFN4NdWCC04cw/Lake-Powell-Site-Design?node-id=8245-7752&t=SAoD4Ef2XqLQNIhe-4
The Video Block should scale responsively with the width of the container it is in while maintaining the native aspect ratio of the video.
if author configures the block with "Full-width Video"=TRUE, the video expands to the full width of the container - this will mostly be used for video backgrounds when the a video is configured in a Hero block