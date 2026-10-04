# eSpeak NG browser speech engine

Copyright (C) 2014–2017 Eitan Isaacson and eSpeak NG contributors.
Distributed under GPL-3.0-or-later, without warranty. See [LICENSE](LICENSE).

Unmodified browser glue and compiled worker: https://github.com/pettarin/espeakng.js-cdn/tree/c023eaca5609b4523613f674d0ee67bd761502f1

Corresponding eSpeak NG source and build instructions: https://github.com/espeak-ng/espeak-ng/tree/1.49.1 and https://github.com/espeak-ng/espeak-ng/blob/1.49.1/emscripten/README.md

APANAM change: the worker's `Module.locateFile` loads the matching voice data from the pinned upstream distribution at jsDelivr. Voice generation runs in the browser; story text is not sent to a speech service. A network connection is required to obtain the voice data on initial use.

The separate integration in `video-text-audio.js` is provided as source in this public repository under GPL-3.0-or-later. You may redistribute and modify it under that license. It has no warranty. The outputs are synthesized speech recordings, not copies of the program.
