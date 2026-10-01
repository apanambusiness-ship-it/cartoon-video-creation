# Photo / Object editing

Open an uploaded JPG/PNG/camera image, select it and press **Edit**, double-click it, or press **Photo / Object Edit** in the main header or below the canvas. Main Edit finds an image even when a caption layer is currently selected; background photos also open in one click. Download progress is shown while AI models load.

1. Click the person/object you want. SlimSAM runs in a worker in your browser.
2. Review the red mask. Additional AI clicks add selection; **AI: हिस्सा हटाएँ** excludes a point. Brush modes add/remove pixels manually. Brush edits should follow the AI clicks, since another AI click recomputes the mask.
3. Choose **अलग करें / Drag**, **यह वस्तु Delete**, or **दूसरी Photo लगाएँ**. With AI fill enabled, LaMa repairs the selected area in the source image. With it disabled, the selected pixels become transparent.
4. The extracted/replacement photo is a normal Studio layer: move, resize, delete, save, reload, undo/redo, export.

The same browser feature works on the public website and the installed PWA on a computer. It does not require a paid API, Supabase, Vercel, or access to the user's computer. First use needs internet and downloads about 76 MB of models plus runtime files. Models are cached when browser storage permits. Offline AI availability is not guaranteed. A slow or memory-limited browser can fail; closing the dialog terminates inference and keeps the original image if the operation has not been applied.

Selection is approximate and must be reviewed. LaMa generates a plausible background; it cannot recover the true content hidden behind a person. Source rotation/flip must be removed before object editing. The selection preview uses up to 1536 pixels on its longest side. Extraction/export preserves the original image resolution. Inpainting uses a local 512×512 patch and repairs a small margin around the selection to avoid object outlines, preserving pixels outside that repair mask. Replacement is a separate rectangular photo layer; it can be resized or cropped using Studio tools.

## External model/runtime notices

- SlimSAM: https://huggingface.co/Xenova/slimsam-77-uniform (Apache-2.0). Quantized vision encoder and prompt decoder, about 13.8 MB. Transformers.js 2.17.2: https://github.com/huggingface/transformers.js (Apache-2.0).
- LaMa ONNX: https://huggingface.co/g-ronimo/lama (`lama_512_int8.onnx`, about 62 MB; Apache-2.0). Original model: https://github.com/advimman/lama.
- ONNX Runtime Web 1.26.0: https://github.com/microsoft/onnxruntime (MIT).

User images are passed to local workers, never to an inference API. Runtime/model downloads contact jsDelivr and Hugging Face. Model hosts therefore see normal download requests, not the edited image.

## Verification

`STUDIO_CHROMIUM_PATH=/tmp/studio-chromium node tests/object-editor-regression.cjs` loads the actual CDN package distributions and actual downloaded model weights through local routes. It does not mock segmentation/inpainting. Tests verify a real-photo selection, LaMa inference, new draggable layer, save/reload, undo/redo, manual selection deletion and native-file replacement. These tests require models under `/tmp/studio-models`, Transformers.js under `/tmp/studio-sam`, and ORT under `/tmp/studio-lama`; they are development fixtures, not shipped in the website repository.
