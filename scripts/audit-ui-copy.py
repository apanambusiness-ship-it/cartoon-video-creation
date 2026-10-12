#!/usr/bin/env python3
"""List static user-facing controls before enabling the language selector.

Run: python3 scripts/audit-ui-copy.py
This is an inventory, not proof that JavaScript-generated text is translated.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path


PAGES = (
    "index.html", "poster-editor.html", "cartoon-video.html", "membership.html",
    "admin.html", "delete-account.html", "about.html", "privacy.html",
    "terms.html", "refund-cancellation.html",
)
CONTROLS = {"button", "option", "label", "summary", "a"}


class Controls(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.items = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.stack.append((tag, None))
        elif tag in CONTROLS:
            self.stack.append((tag, []))
        elif self.stack:
            self.stack.append((tag, None))

    def handle_data(self, data):
        for tag, parts in self.stack:
            if parts is not None:
                parts.append(data)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] != tag:
                continue
            _, parts = self.stack[index]
            if parts is not None:
                label = " ".join(" ".join(parts).split())
                if label:
                    self.items.append((tag, label))
            del self.stack[index:]
            break


def main():
    root = Path(__file__).resolve().parents[1]
    grand_total = 0
    for name in PAGES:
        parser = Controls()
        parser.feed((root / name).read_text(encoding="utf-8"))
        counts = Counter(tag for tag, _ in parser.items)
        total = sum(counts.values())
        grand_total += total
        print(f"{name}: {total} visible controls ({dict(counts)})")
    print(f"Total static controls: {grand_total}")
    print("JavaScript-generated controls and messages require a separate audit.")


if __name__ == "__main__":
    main()
