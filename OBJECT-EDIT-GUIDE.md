# Photo / Object editing

Open an uploaded JPG/PNG/camera image, select it and press **Edit**, double-click it, or press **वस्तु चुनें / Drag** in the main header or below the canvas. Main Edit finds an image even when a caption layer is currently selected; background photos also open in one click. Download progress is shown while AI models load.

1. Click the person/object you want. SlimSAM runs in a worker in your browser.
2. Review the red mask. Additional AI clicks add selection; **AI: हिस्सा हटाएँ** excludes a point. Brush modes add/remove pixels manually. Brush edits should follow the AI clicks, since another AI click recomputes the mask.
3. After AI selection, Drag mode activates automatically. Hold the selected red object and drag it directly on the original canvas (desktop): it becomes a separate layer at the moved position when you release. The original photo stays at its original position. Desktop action buttons stay in a compact side panel; mobile retains the fitted preview. Choose **अलग करें / Drag**, **यह वस्तु Delete**, or **दूसरी Photo लगाएँ**. Transparent PNGs default to AI fill off, preserving the original transparent background and every pixel outside the selection. Main Delete/Photo-replace controls open this object-selection editor. Whole-rectangle colour/photo patches remain explicitly labelled under Advanced. With AI fill enabled, LaMa repairs the selected area in the source image. With it disabled, the selected pixels become transparent.
4. After the action, the selection overlay clears and the template stays visible. Object mode remains active on desktop: click another original image to select its contents without a modal or navigation. Press **Edit पूरा / बंद** or the header mode button to leave selection mode. Extracted objects are ordinary draggable layers and require no repeated AI selection. Then the selected extracted object can be dragged by holding its centre on the main canvas. A visible result message confirms the next step. The extracted/replacement photo is a normal Studio layer: move, resize, delete, save, reload, undo/redo, export.

The same browser feature works on the public website and the installed PWA on a computer. It does not require a paid API, Supabase, Vercel, or access to the user's computer. First use needs internet and downloads about 76 MB of models plus runtime files. Models are cached when browser storage permits. Offline AI availability is not guaranteed. A slow or memory-limited browser can fail; closing the dialog terminates inference and keeps the original image if the operation has not been applied.

Selection is approximate and must be reviewed. LaMa generates a plausible background; it cannot recover the true content hidden behind a person. Source rotation/flip must be removed before object editing. The selection preview uses up to 1536 pixels on its longest side. Extraction/export preserves the original image resolution. Inpainting uses a local 512×512 patch and repairs a small margin around the selection to avoid object outlines, preserving pixels outside that repair mask. Replacement is a separate rectangular photo layer; it can be resized or cropped using Studio tools.

## External model/runtime notices

- SlimSAM: https://huggingface.co/Xenova/slimsam-77-uniform (Apache-2.0). Quantized vision encoder and prompt decoder, about 13.8 MB. Transformers.js 2.17.2: https://github.com/huggingface/transformers.js (Apache-2.0).
- LaMa ONNX: https://huggingface.co/g-ronimo/lama (`lama_512_int8.onnx`, about 62 MB; Apache-2.0). Original model: https://github.com/advimman/lama.
- ONNX Runtime Web 1.26.0: https://github.com/microsoft/onnxruntime (MIT).

User images are passed to local workers, never to an inference API. Runtime/model downloads contact jsDelivr and Hugging Face. Model hosts therefore see normal download requests, not the edited image.

## Verification

`STUDIO_CHROMIUM_PATH=/tmp/studio-chromium node tests/object-editor-regression.cjs` loads the actual CDN package distributions and actual downloaded model weights through local routes. It does not mock segmentation/inpainting. Tests verify a real-photo selection, LaMa inference, new draggable layer, save/reload, undo/redo, manual selection deletion and native-file replacement. These tests require models under `/tmp/studio-models`, Transformers.js under `/tmp/studio-sam`, and ORT under `/tmp/studio-lama`; they are development fixtures, not shipped in the website repository.

For already-painted black/colour rectangles, use Undo in the current browser session or reopen the original uploaded template. A later software update cannot reconstruct overwritten source pixels.

While the object editor is open, Delete/Backspace acts on the object selection rather than the full source image. OCR text-hit boxes only appear after explicit text recognition; they are hidden during object editing and after reload.

## Editable text layers

**Text को editable layers बनाएँ** recognizes text (if needed), creates separate draggable Studio text layers and changes only recognized glyph pixels in the source using the sampled surrounding colour. It does not fill the entire OCR bounding rectangle. Text colour is estimated from contrasting image pixels; font size is fitted to the recognized bounds in stage coordinates, avoiding a second image-to-stage scale. OCR boxes stay transparent until hovered/focused, and **Text पहचान बंद** hides them. Recognition ignores low-confidence regions below 45; destructive text operations require confidence at least 65. Conversion checks foreground colour consistency and background uniformity, and rejects the entire operation without changing the source if a region is uncertain or lies on a complex background. The conversion is one undoable operation and saved text layers need no further OCR after reload. Exact fonts and patterned backgrounds are not reconstructed; review spelling and use Undo if the result is unsuitable.

The template layer panel supports text/font-size/colour edits, Fit to text box, Duplicate, Lock/Unlock, Hide/Show, stacking order and full layer deletion. Extracted photo objects remain normal image layers. This is not automatic decomposition of every object in a flattened design.

Moving image and text layers accounts for the canvas zoom. Dragging saves on release and records the original position once movement starts; clicking alone does not create a drag undo entry. Locked image layers remain locked after project restore.
