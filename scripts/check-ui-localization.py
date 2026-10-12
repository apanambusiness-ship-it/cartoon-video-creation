#!/usr/bin/env python3
"""Fail a release gate until all static controls and script sources are reviewed.

This intentionally does not count a translated catalog as proof that a page uses it.
Run from the repository root: python3 scripts/check-ui-localization.py
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys

PAGES = ('index.html', 'poster-editor.html', 'cartoon-video.html',
         'membership.html', 'admin.html', 'delete-account.html',
         'about.html', 'privacy.html', 'terms.html',
         'refund-cancellation.html')
CONTROL_TAGS = {'button', 'a', 'label', 'option', 'summary'}
TEXT_ATTRIBUTES = {'placeholder', 'aria-label', 'title'}


class Inventory(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.untranslated = []
        self.scripts = set()

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag == 'script' and props.get('src'):
            path = urlsplit(props['src']).path
            if path and not urlsplit(props['src']).scheme:
                self.scripts.add(path)
        if tag in ('script', 'style'):
            self.stack.append((tag, None, props))
            return
        if not any(entry[0] in ('script', 'style') for entry in self.stack):
            for name in TEXT_ATTRIBUTES:
                if (props.get(name) or '').strip() and not props.get('data-ui-' + name + '-key'):
                    self.untranslated.append((name, props[name].strip()[:90]))
        self.stack.append((tag, [] if tag in CONTROL_TAGS else None, props))

    def handle_data(self, data):
        if any(entry[0] in ('script', 'style') for entry in self.stack):
            return
        for tag, parts, _ in reversed(self.stack):
            if parts is not None:
                parts.append(data)
                break

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] != tag:
                continue
            _, parts, props = self.stack[index]
            if parts is not None and ''.join(parts).strip() and not props.get('data-ui-key'):
                self.untranslated.append((tag, ' '.join(''.join(parts).split())[:90]))
            del self.stack[index:]
            break


def audit(root):
    scripts = set()
    missing = 0
    for page in PAGES:
        source = root / page
        if not source.is_file():
            print(f'{page}: missing page')
            missing += 1
            continue
        parser = Inventory()
        parser.feed(source.read_text(encoding='utf-8'))
        scripts.update(parser.scripts)
        missing += len(parser.untranslated)
        print(f'{page}: {len(parser.untranslated)} static controls/attributes without locale keys')
    # Each script can insert text after load. Explicit review is needed before a
    # page can be certified; absence of literal strings is not evidence of safety.
    pending = sorted(s for s in scripts if not (root / (s + '.locale-reviewed')).is_file())
    print(f'{len(scripts)} unique page scripts; {len(pending)} require dynamic UI review')
    if pending:
        print('Examples:', ', '.join(pending[:10]))
    print(f'Unlocalized static placements: {missing}')
    return 1 if missing or pending else 0


if __name__ == '__main__':
    sys.exit(audit(Path(__file__).resolve().parents[1]))
