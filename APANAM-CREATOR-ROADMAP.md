# APANAM Creator: ten-tool comparison and build order

Reviewed 20 September 2026. These are ten creative products accessible in India, selected for feature comparison, not a verified popularity ranking. APANAM will build its own implementation; third-party templates, models and assets must not be copied.

| Product | Distinctive capability to learn from | Official source |
| --- | --- | --- |
| Canva | Templates, posters, video and accessible design workflow | https://www.canva.com/en_in/ |
| Adobe Express | Posts, images, video, brand workflow and resizing | https://www.adobe.com/express/ |
| Picsart | Photo editing and creative AI tools | https://picsart.com/photo-editor/ |
| Photoroom | Product-photo cleanup, backgrounds and product scenes | https://www.photoroom.com/ |
| InVideo | Scene and timeline based video editing | https://invideo.io/ and https://help-studio.invideo.io/en/articles/9405284-how-to-change-the-duration-of-a-scene |
| Animaker | Animated character builder, voice and subtitles | https://www.animaker.com/ |
| Renderforest | Intros, logo animation, explainer video and mockups | https://www.renderforest.com/ |
| VEED | Subtitles, dubbing and brand-aware video | https://www.veed.io/ |
| Clipchamp | Recording, trimming and browser video export | https://clipchamp.com/en/ |
| KineMaster | Layered timeline, keyframes and mobile video editing | https://www.kinemaster.com/features |

## What is already in this repository

- Poster editor: layers, templates, editable text, image upload, brand kit, local gallery, JSON backup and PNG/JPG/PDF exports.
- Cartoon video: independent `cartoon-video.html` page with scenes, preview, browser WebM export and optional imported or recorded audio track. Speech synthesis is a preview voice only.
- AI poster: separate Worker and D1 experiment; availability depends on configured Cloudflare bindings. No verified email login or per-user neuron allocation.

## Progress (20 September 2026)

- Unified Creator entry shipped: poster, product design, video and local poster gallery.
- Cartoon scene reorder, JSON project backup, character choice, scene fade, editable text styling, photo backgrounds, scene duplication and scene PNG export shipped.
- Optional uploaded or browser-recorded narration is mixed into WebM export; browser playback and exported audio still require hands-on verification across target devices.
- Separate browser video gallery supports multiple projects, rename, deletion and JSON gallery transfer. Video timeline shows progress and allows seeking to a scene preview. Audio is kept separately from the JSON scene backup.
- Scene captions can be downloaded as a timed SRT file. A compact logo can be applied to all scenes. Imported or recorded audio has a listening control, volume setting and optional loop; it now plays alongside the video preview. Browser/device verification is still needed for synchronized playback.
- The poster's saved brand logo can be copied into video scenes. Local video gallery saves audio files up to 30 MB along with scenes; JSON backups still require a separate audio file. Individual poster and video projects have their own JSON backup controls.
- Creator menu can send the current poster to a new video scene without replacing existing scenes; the complete poster is kept inside a fitted image for the scene.
- A saved video's scenes can be appended to the open project, up to 100 scenes total. Audio tracks are not merged when appending projects.
- Each scene photo can now use cover or contain framing to avoid cropping product images and posters.
- Product Photo Quick Look now updates the same brightness, contrast and saturation values as the image controls and includes an original-look reset.
- Poster project saves and JSON backups now preserve the transparent canvas setting when restored.
- Poster JPG/WebP export now uses the same canvas renderer as PNG. Gallery JPG/PDF exports composite transparent pixels over white; PNG and WebP can retain transparency.

## Build sequence (one usable milestone at a time)

1. **Unified Creator entry:** clearly link poster, product visuals, video and projects without changing existing editor behavior.
2. **Poster editing quality:** stabilize text, photo crop/background, templates, mobile layout and exports; check each end to end.
3. **Product photo studio:** non-destructive background, product framing and marketplace aspect ratios; keep original uploads available.
4. **Cartoon video timeline:** individual scenes/layers, duration, reorder, transitions and local project backup.
5. **Audio export:** user-recorded/imported audio plus licensed music and narration must actually be present in downloaded video.
6. **Captions and language:** Hindi and other Indian languages with editable timings and fonts.
7. **Brand and reusable assets:** logo, colors, fonts and reusable originals across poster and video.
8. **Project continuity:** one gallery with clear type labels, reliable backups and recovery across devices.
9. **AI optional:** verify free account limits and server-side metering; show real remaining usage, never promise 10,000 neurons per login.
10. **Final production pass:** phone and desktop checks, accessibility, export quality, privacy and free-tier cost limits.

Long films, multi-user sync and paid plans require durable storage, rendering infrastructure, verified authentication and a documented operating budget; mark them planned until truly usable.
