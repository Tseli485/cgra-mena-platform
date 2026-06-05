#!/bin/bash
# macOS — double-cliquez ce fichier (Lancer-MENA-Tuteur.command) dans le Finder.
# Nécessite Python 3 (préinstallé sur macOS récent ; sinon : https://www.python.org).
cd "$(dirname "$0")"
echo "Plateforme MENA Tuteur — démarrage local…"
python3 server.py
