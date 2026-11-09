# SnapArt story film

## Context and goals

The story section must show one full-width film with the oversized title “The Story Of Us” centered in the frame. It must preserve SnapArt's cream, espresso and pastel pink palette. Composition reference: https://1stdecember.com/ (viewed 2026-11-06).

## Design tokens and foundations

The component must use the existing surface, text, spacing, radius and motion tokens. A balanced dark scrim must protect the centered cream serif title and pastel handwritten second line. The cream edge and subtle grain should connect the film with the preceding canvas.

## Component rules

- `components/home/StoryReel.tsx` owns the media and controls; `locales/en.ts` owns copy; `.sr-*` in `app/globals.css` owns presentation.
- The film must fill its reserved container with `object-fit: cover`.
- The visible title must be a keyboard-operable button with `aria-expanded` and `aria-controls`. Hover should gently tilt the title and stretch the dashed tear seam. Activation must pause playback, capture the current film frame in the existing canvases and tear the two jagged halves outward over 1.2 seconds, revealing the journey article. No duplicate video decoder should be used.
- The journey must fit a single viewport without nested vertical scrolling: four image/illustration memories with concise captions, four columns on desktop and a two-by-two board on mobile. It must receive focus on open and support Back to the film and Escape. Closing must animate the two film halves back together over 1.1 seconds before restoring focus and previous playback. Reduced motion must switch immediately. Journey copy must not invent dates or company statistics.
- On first viewport entry, two synchronized canvas halves must slide inward from the left and right over 1.35 seconds, then reveal the original video without a seam. Both canvases must draw from the same video source; no second video decoder should be introduced. Canvas rendering must stop after assembly and on unmount. Reduced motion and media errors must bypass assembly. The title should enter after assembly.
- The default state uses a poster while metadata loads. Entering the viewport must attempt muted inline playback. Leaving it or hiding the document must pause playback. An explicit user pause must survive re-entry.
- The film surface must toggle playback on click, tap, Enter or Space, without visible play/pause icons. Its accessible label must describe the current action. Media failure must preserve the artwork and show an error.
- Buttons must support pointer, touch, Enter and Space with visible focus, hover, active and disabled states. Touch targets must remain at least 44 × 44 CSS pixels.
- On mobile the title must remain centered and scale to fit the viewport. Small labels, descriptions, timestamps and control bars must not be rendered.

## Accessibility and acceptance criteria

- The section must have a labelled `h2`. Control labels must describe the current action.
- `prefers-reduced-motion` must start the video paused; explicit Play must remain available.
- Narrated replacement films must provide genuine captions through `captionsSrc`. The included silent clip does not need invented subtitles.
- Keyboard focus on the film surface must show an inset pastel outline; the surface must not intercept scrolling.
- QA must check a desktop viewport, a 390px mobile viewport, playback/pause, re-entry, real media dimensions, and absence of horizontal overflow.

## Content and tone

“The Story Of Us” must be the only visible title. “The Story” uses large cream serif lettering and “Of Us” uses pastel handwritten lettering. The included stock film must retain a screen-reader credit and its license record; it must not be described as authentic founder footage.

## Anti-patterns and integration

Do not restore small title labels, ticker ribbons, statistic pills or control bars over the footage. Do not make the poster move to imitate video playback.

The included mock film is local 4K (3840 × 2160), 8.092 seconds, silent. Source and license are recorded in `public/assets/videos/CREDITS.md`. Replace it by passing `src`, `poster`, `isDemo={false}` and genuine `captionsSrc` for speech. The background film stays muted. Keep local files in `public/assets/videos/`.

## Image asset

`public/assets/images/snapart-story-mood.jpg` is the generated still used behind the video if media fails. It is an illustrative mood image, not documentary evidence. Generated with the built-in ImageGen tool and converted to JPEG for the site. The normal video poster is a still from the stock clip.

Final generation prompt:

> Use case: photorealistic-natural. Asset type: cinematic 16:9 background poster for an art studio film section on SnapArt's website. Create a single wide still photograph, no typography and no UI. A beautifully intimate painter's studio: close-up of two adult hands working with a paintbrush on a large textured cotton canvas, palette with thick yellow, rose, teal and cobalt paint, wooden easel, warm late-afternoon window light. Composition: the painter's hands and the brightly painted organic abstract canvas occupy the RIGHT two thirds, beautifully tactile pigments and cotton visible. LEFT third remains a dark softly out-of-focus espresso studio interior with open negative space for website text overlay. Rich filmic contrast, soft halation, fine analog grain, sophisticated art documentary cinematography, candid real imperfections, cream cotton clothing cropped at torso, no faces. Palette consistent with cream canvas #f7f4ed, espresso #411f15 and accents #ffe515. This is an illustrative mood poster, not evidence of any real studio, no logos, no text, no fake film bars, no borders, no watermarks. Landscape 16:9.

## QA checklist

- [x] Desktop (1440 × 900) and mobile (390 × 844) copy/controls remain legible; mobile body width is 390px with no horizontal overflow.
- [x] Local video reports 3840 × 2160 and plays inline, muted.
- [x] Play/pause, offscreen pause and preserved manual pause work.
- [ ] Reduced motion begins paused and manual Play still works.
- [ ] The full film surface toggles playback with pointer and keyboard, without visible controls.
- [x] Stock attribution is retained for screen readers and in asset credits; no unverified milestones remain.
- [x] Lint and TypeScript checks pass.

Reduced-motion behavior is implemented and code-reviewed; the preference was not changed on the owner's operating system during QA. Browser console recorded no application errors during the tested flow.
