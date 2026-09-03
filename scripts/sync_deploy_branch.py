"""
TransitERA Deployment Branch Synchronizer
Membuat dan menyinkronkan branch 'deploy' yang bersih (production-only).
Branch 'main' tetap menjadi branch riset & dev lengkap (dengan context/, notulensi, PRD).
Branch 'deploy' hanya memuat kode aplikasi esensial (webdev/, docker-compose, docs/).
"""
import subprocess
import sys
import os

EXCLUDE_FROM_DEPLOY = [
    "context",
    "scripts",
    ".agents",
    "TransitERA_PRD.md",
    "TransitERA_Responsive_PRD.md",
    "TransitERA_Security_PRD.md",
    "TRANSITERA_AUDIT_AND_ROADMAP.md"
]

def run_cmd(cmd, check=True):
    print(f"-> {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and res.returncode != 0:
        print(f"Error executing: {cmd}\n{res.stderr}")
        sys.exit(res.returncode)
    return res.stdout.strip()

def sync_deploy_branch():
    print("=== TransitERA Deploy Branch Sync ===")
    
    # 1. Check current branch and git status
    status = run_cmd("git status --porcelain")
    if status:
        print("Peringatan: Ada perubahan lokal yang belum di-commit di working tree.")
        print("Silakan commit atau stash perubahan terlebih dahulu sebelum menyinkronkan branch deploy.")
        sys.exit(1)
        
    current_branch = run_cmd("git rev-parse --abbrev-ref HEAD")
    print(f"Current branch: {current_branch}")
    
    # 2. Check if 'deploy' branch exists
    branches = run_cmd("git branch --list deploy")
    if "deploy" in branches:
        print("Branch 'deploy' sudah ada. Beralih ke branch 'deploy'...")
        run_cmd("git checkout deploy")
        run_cmd(f"git merge {current_branch} -m 'chore(deploy): sync with latest changes from {current_branch}'", check=False)
    else:
        print("Membuat branch baru 'deploy' dari branch aktif saat ini...")
        run_cmd("git checkout -b deploy")

    # 3. Hapus file-file non-esensial dari index branch deploy
    print("Membersihkan file konteks internal & riset dari branch 'deploy'...")
    for item in EXCLUDE_FROM_DEPLOY:
        if os.path.exists(item):
            run_cmd(f"git rm -r --cached {item} --ignore-unmatch", check=False)
            
    # 4. Commit status bersih pada branch deploy
    run_cmd("git commit -m 'chore(release): clean production deployment bundle' --allow-empty", check=False)
    print("Branch 'deploy' berhasil disiapkan dan siap di-push ke cloud!")
    print("\nUntuk mendeploy branch ini ke Vercel / Cloud:")
    print("  git push -u origin deploy")
    
    # 5. Kembalikan user ke branch asal (main)
    print(f"\nKembali ke branch asal: {current_branch}...")
    run_cmd(f"git checkout {current_branch}")
    print(f"Selesai! Anda kembali berada di branch '{current_branch}'.")

if __name__ == "__main__":
    sync_deploy_branch()
