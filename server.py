#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lanceur autonome — Plateforme MENA Tuteur.
Sert l'application en local (http://localhost) et ouvre le navigateur.
Empaqueté en .exe via PyInstaller (l'utilisateur n'a pas besoin de Python)."""
import http.server, socketserver, os, sys, threading, webbrowser, functools, socket

def base_dir():
    # En .exe onefile, les données sont extraites dans sys._MEIPASS
    if getattr(sys, "frozen", False):
        return os.path.join(sys._MEIPASS, "pwa")
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "pwa")

def free_port(preferred=8080):
    for p in (preferred, 8081, 8082, 8090, 0):
        try:
            s = socket.socket(); s.bind(("127.0.0.1", p)); port = s.getsockname()[1]; s.close()
            return port
        except OSError:
            continue
    return 8080

DIR = base_dir()
PORT = free_port()
URL = "http://localhost:%d" % PORT

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=DIR, **k)
    def log_message(self, *a):
        pass  # silencieux

def main():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
    print("=" * 60)
    print("  Plateforme MENA Tuteur")
    print("  Adresse : " + URL)
    print("  Laissez cette fenetre ouverte. Fermez-la pour quitter.")
    print("=" * 60)
    threading.Timer(1.0, lambda: webbrowser.open(URL)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
