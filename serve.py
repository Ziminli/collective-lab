"""Serve Collective Lab locally. Usage: python3 serve.py [port]"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8847
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).parent))
    try:
        with ThreadingHTTPServer(('127.0.0.1', port), handler) as server:
            print(f'Collective Lab: http://localhost:{port}', flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
    except OSError as error:
        print(f'Could not start the preview: {error}. Try another port: python3 serve.py 8848', file=sys.stderr)
        sys.exit(1)
