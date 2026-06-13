#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lanceur autonome — Plateforme MENA Tuteur.
Sert l'application en local (http://localhost) et ouvre le navigateur.
Empaqueté en .exe via PyInstaller (l'utilisateur n'a pas besoin de Python)."""
import http.server, os, sys, threading, webbrowser, socket
import json, urllib.request, tempfile, subprocess, shutil

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

def _read_version():
    try:
        with open(os.path.join(DIR, "version.json"), encoding="utf-8") as f:
            return json.load(f).get("version", "unknown")
    except Exception:
        return "unknown"

APP_VERSION = _read_version()
_VERSION_CHECK_URL = "https://tseli485.github.io/cgra-mena-platform/version.json"
_RELEASE_EXE_URL = (
    "https://github.com/Tseli485/cgra-mena-platform"
    "/releases/latest/download/MENA-Tuteur-Windows.exe"
)

# État partagé de la mise à jour (lecture/écriture thread-safe via GIL)
_upd = {"status": "idle", "percent": 0, "error": ""}


def _do_update():
    """Thread de téléchargement + remplacement de l'exe (Windows uniquement)."""
    global _upd
    try:
        if not (getattr(sys, "frozen", False) and os.name == "nt"):
            _upd = {"status": "error", "percent": 0, "error": "non_windows_exe"}
            return

        exe_path = install_target()   # on écrase TOUJOURS l'emplacement d'installation unique
        tmp_dir = tempfile.mkdtemp(prefix="mena_upd_")
        tmp_exe = os.path.join(tmp_dir, "MENA-Tuteur-new.exe")

        req = urllib.request.Request(
            _RELEASE_EXE_URL,
            headers={"User-Agent": "MENA-Tuteur-Updater/1.0"}
        )
        with urllib.request.urlopen(req, timeout=180) as resp:
            total = int(resp.headers.get("Content-Length") or 0)
            downloaded = 0
            with open(tmp_exe, "wb") as f:
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    _upd["percent"] = int(downloaded * 100 / total) if total else -1

        _upd["status"] = "applying"

        # Script PowerShell : attend la fin du processus actuel, remplace, relance
        ps_script = (
            "$p={pid};$src='{src}';$dst='{dst}'\n"
            "$t=0\n"
            "while((Get-Process -Id $p -ErrorAction SilentlyContinue) -and $t -lt 120)"
            "{{Start-Sleep -Milliseconds 500;$t++}}\n"
            "Start-Sleep -Milliseconds 800\n"
            "Copy-Item -Path $src -Destination $dst -Force\n"
            "Remove-Item -Path $src -Force -ErrorAction SilentlyContinue\n"
            "Start-Process -FilePath $dst\n"
        ).format(
            pid=os.getpid(),
            src=tmp_exe.replace("'", "''"),
            dst=exe_path.replace("'", "''"),
        )
        ps_path = os.path.join(tmp_dir, "mena-update.ps1")
        with open(ps_path, "w", encoding="utf-8") as f:
            f.write(ps_script)

        subprocess.Popen(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass",
             "-NonInteractive", "-File", ps_path],
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )

        _upd["status"] = "done"
        # Laisse 2 s pour que le navigateur récupère le statut "done" avant la fermeture
        threading.Timer(2.0, lambda: os._exit(0)).start()

    except Exception as exc:
        _upd = {"status": "error", "percent": 0, "error": str(exc)}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=DIR, **k)

    def log_message(self, *a):
        pass  # silencieux

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/check-update":
            self._api_check_update()
        elif path == "/api/update":
            self._api_start_update()
        elif path == "/api/update-status":
            self._api_update_status()
        else:
            super().do_GET()

    # ── helpers ──────────────────────────────────────────────────────────────

    def _json(self, data, code=200):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # ── API endpoints ─────────────────────────────────────────────────────────

    def _api_check_update(self):
        is_exe = getattr(sys, "frozen", False) and os.name == "nt"
        try:
            req = urllib.request.Request(
                _VERSION_CHECK_URL + "?nc=" + str(os.getpid()),
                headers={"User-Agent": "MENA-Tuteur/1.0"},
            )
            with urllib.request.urlopen(req, timeout=8) as r:
                remote = json.loads(r.read())
            self._json({
                "exe": is_exe,
                "current": APP_VERSION,
                "latest": remote.get("version", ""),
            })
        except Exception as exc:
            self._json({
                "exe": is_exe,
                "current": APP_VERSION,
                "latest": "",
                "error": str(exc),
            })

    def _api_start_update(self):
        if _upd["status"] in ("downloading", "applying"):
            self._json({"ok": True, "already": True})
            return
        _upd["status"] = "downloading"
        _upd["percent"] = 0
        _upd["error"] = ""
        threading.Thread(target=_do_update, daemon=True).start()
        self._json({"ok": True})

    def _api_update_status(self):
        self._json(dict(_upd))


def install_target():
    """Emplacement d'installation UNIQUE et fixe de l'exe (Windows)."""
    base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~")
    return os.path.join(base, "MENA-Tuteur", "MENA-Tuteur.exe")


def _make_shortcut(target):
    """(Re)crée le raccourci 'MENA Tuteur' (Bureau + menu Démarrer) pointant
    TOUJOURS vers l'emplacement d'installation fixe — un seul raccourci, une
    seule version."""
    try:
        exe = target.replace("'", "''")
        ps = (
            "$w=New-Object -ComObject WScript.Shell;"
            "foreach($f in @($w.SpecialFolders.Item('Desktop'),$w.SpecialFolders.Item('Programs'))){"
            "$p=Join-Path $f 'MENA Tuteur.lnk';$s=$w.CreateShortcut($p);"
            "$s.TargetPath='" + exe + "';$s.IconLocation='" + exe + ",0';"
            "$s.Description='Plateforme MENA Tuteur';$s.Save()}"
        )
        subprocess.run(["powershell", "-NoProfile", "-Command", ps],
                       capture_output=True, text=True, timeout=20)
    except Exception:
        pass


def ensure_installed():
    """Garantit une installation UNIQUE à un emplacement fixe (%LOCALAPPDATA%).
    Tout exe lancé depuis ailleurs (Téléchargements, Bureau…) se recopie à cet
    emplacement en ÉCRASANT l'ancienne version, met à jour le raccourci, se
    relance depuis là, puis supprime l'installeur source. Résultat : jamais
    plusieurs versions sur le PC. Renvoie True s'il faut quitter ce processus."""
    if not (getattr(sys, "frozen", False) and os.name == "nt"):
        return False
    try:
        target = os.path.abspath(install_target())
        current = os.path.abspath(sys.executable)
        if os.path.normcase(current) == os.path.normcase(target):
            return False  # déjà à l'emplacement d'installation : rien à faire
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copy2(current, target)          # écrase l'ancienne version installée
        _make_shortcut(target)
        # Quand ce processus aura quitté : supprime l'installeur source puis lance
        # la version installée (emplacement unique).
        ps = (
            "$src='{src}';$tgt='{tgt}';"
            "for($i=0;$i -lt 60 -and (Test-Path $src);$i++){{Start-Sleep -Milliseconds 300;"
            "try{{Remove-Item -LiteralPath $src -Force -ErrorAction Stop;break}}catch{{}}}}"
            "Start-Process -FilePath $tgt"
        ).format(src=current.replace("'", "''"), tgt=target.replace("'", "''"))
        subprocess.Popen(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass",
                          "-WindowStyle", "Hidden", "-Command", ps],
                         creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        print("  Installation a l'emplacement unique : " + target)
        return True
    except Exception:
        return False  # en cas d'echec : on continue normalement depuis l'emplacement actuel


def ensure_shortcut():
    """Crée/rafraîchit le raccourci pointant vers l'emplacement d'installation fixe."""
    if os.name != "nt" or not getattr(sys, "frozen", False):
        return
    _make_shortcut(install_target())


def _downloads_dir():
    """Dossier Téléchargements (gère un éventuel déplacement via le registre)."""
    try:
        import winreg
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders")
        val, _ = winreg.QueryValueEx(key, "{374DE290-123F-4565-9164-39C4925E467B}")
        winreg.CloseKey(key)
        val = os.path.expandvars(val)
        if val and os.path.isdir(val):
            return val
    except Exception:
        pass
    return os.path.join(os.path.expanduser("~"), "Downloads")


def clean_downloads():
    """Filet de sécurité : supprime les installeurs 'MENA-Tuteur-Windows*.exe'
    qui traînent dans Téléchargements (l'app installée vit dans %LOCALAPPDATA%,
    sous un autre nom). Ne touche jamais l'exe en cours. Silencieux, best-effort."""
    if not (getattr(sys, "frozen", False) and os.name == "nt"):
        return
    try:
        import glob
        current = os.path.normcase(os.path.abspath(sys.executable))
        n = 0
        for f in glob.glob(os.path.join(_downloads_dir(), "MENA-Tuteur-Windows*.exe")):
            try:
                if os.path.normcase(os.path.abspath(f)) == current:
                    continue  # ne jamais supprimer l'exe en cours d'exécution
                os.remove(f)
                n += 1
            except Exception:
                pass
        if n:
            print("  Nettoyage : %d copie(s) obsolete(s) supprimee(s) des Telechargements." % n)
    except Exception:
        pass


def main():
    # Installation unique : si on tourne depuis Téléchargements/Bureau, on se
    # recopie à l'emplacement fixe (écrase l'ancienne version), on relance de
    # là et on quitte. Évite d'avoir plusieurs versions sur le PC.
    if ensure_installed():
        return
    ensure_shortcut()
    threading.Thread(target=clean_downloads, daemon=True).start()  # filet de sécurité anti-doublons
    # ThreadingHTTPServer : le sondage /api/update-status reste réactif pendant
    # le téléchargement de la mise à jour (qui tourne dans un thread séparé).
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("=" * 60)
    print("  Plateforme MENA Tuteur  v" + APP_VERSION)
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
