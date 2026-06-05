#!/bin/bash
# Linux — lancez :  bash Lancer-MENA-Tuteur.sh   (ou rendez-le exécutable : chmod +x)
# Nécessite Python 3 (préinstallé sur la plupart des distributions).
cd "$(dirname "$0")"
echo "Plateforme MENA Tuteur — démarrage local…"
python3 server.py
