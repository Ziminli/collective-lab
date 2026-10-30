"""Validate and assemble a dependency-free GitHub Pages artifact."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / '_site'


class LocalAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        value = attrs.get('src') if tag == 'script' else attrs.get('href') if tag == 'link' else None
        if not value:
            return
        url = urlsplit(value)
        if url.scheme or url.netloc:
            return
        if url.path.startswith('/'):
            raise ValueError(f'Asset must support a GitHub Pages project subpath: {value}')
        asset = unquote(url.path)
        if '..' in Path(asset).parts or not (ROOT / asset).is_file():
            raise ValueError(f'Missing or invalid local asset: {value}')
        self.assets.add(asset)


def main():
    parser = LocalAssets()
    parser.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
    required = {'styles.css', 'content.js', 'lessons.js', 'animations.js',
                'tensor-views.js', 'semantics.js', 'zh.js', 'pipeline-plans.js',
                'pipeline.js', 'app.js', 'preferences.js'}
    if parser.assets != required:
        raise ValueError(f'Unexpected asset manifest: {parser.assets ^ required}')
    DEST.mkdir(exist_ok=True)
    # Limit deployment to public site assets; repository metadata and tooling stay out.
    for asset in sorted(required | {'index.html', 'pipeline-notes.md'}):
        shutil.copyfile(ROOT / asset, DEST / asset)
    (DEST / '.nojekyll').touch()
    print(f'Validated and assembled {len(required) + 3} files in {DEST}')


if __name__ == '__main__':
    main()
