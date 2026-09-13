"""
TransitERA Security Secret Scanner
Memeriksa seluruh repositori untuk memastikan tidak ada kunci API,
password database, atau token sensitif yang ter-commit secara terbuka.
"""
import os
import re
import sys

SECRET_PATTERNS = [
    (r"AIzaSy[0-9A-Za-z-_]{33}", "Google Gemini / Maps API Key"),
    (r"AQ\.[0-9A-Za-z-_]{20,}", "Google Stitch / AI Studio Key"),
    (r"sk-[a-zA-Z0-9]{32,}", "OpenAI API Key"),
    (r"['\"][0-9a-f]{24}['\"]", "Potential MAPID / Hex API Key"),
    (r"postgres(?:ql)?:\/\/[a-zA-Z0-9_-]+:[^@\s]+@[a-zA-Z0-9_.-]+", "Postgres URI with password"),
    (r"ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token"),
    (r"-----BEGIN (?:RSA )?PRIVATE KEY-----", "Private Key Header")
]

IGNORE_DIRS = {".git", ".pytest_cache", "node_modules", ".next", "__pycache__", "dist", "build"}
IGNORE_EXTS = {".png", ".jpg", ".jpeg", ".ico", ".joblib", ".whl", ".pyc", ".geojson"}

def scan_secrets(root_dir="."):
    findings = []
    print(f"Memulai audit keamanan secret scanning pada direktori: {os.path.abspath(root_dir)}...")
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in IGNORE_EXTS or file.startswith(".env"):
                continue
                
            fpath = os.path.join(root, file)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for pattern, label in SECRET_PATTERNS:
                        matches = re.finditer(pattern, content)
                        for m in matches:
                            # Abaikan jika berupa placeholder / string dummy
                            matched_str = m.group(0)
                            if "your_gemini_api_key" in matched_str or "transitera_secure_2026" in matched_str:
                                continue
                            findings.append((fpath, label, matched_str[:12] + "..." if len(matched_str) > 12 else matched_str))
            except Exception:
                pass

    if findings:
        print("\n[PERINGATAN KEAMANAN] Ditemukan potensi secret yang terekspos:")
        for path, label, sample in findings:
            print(f"  - {path}: {label} ({sample})")
        return False
    else:
        print("\n[BERSIH] Audit keamanan selesai: Tidak ditemukan API Key atau secret plaintext!")
        return True

if __name__ == "__main__":
    success = scan_secrets(".")
    sys.exit(0 if success else 1)
