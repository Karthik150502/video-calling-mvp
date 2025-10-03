import os
import subprocess
import random
from datetime import datetime, timedelta

# === Config ===
repo_path = "python-github"
author_name = "Karthik150502"
author_email = "karthikrdycool@gmail.com"  # must be verified on GitHub
days_back = 365   # how many past days to consider
day_probability = 0.50  # 50% chance a day gets commits
max_commits_per_day = 50

# === Setup Repo ===
if not os.path.exists(repo_path):
    os.makedirs(repo_path)
    subprocess.run(["git", "init"], cwd=repo_path)

# === Generate Commits ===
for i in range(days_back):
    date = datetime.now() - timedelta(days=i)
    date_str = date.strftime("%Y-%m-%d %H:%M:%S")

    # Decide randomly if this day gets commits
    if random.random() < day_probability:
        num_commits = random.randint(1, max_commits_per_day)

        for j in range(num_commits):
            file_path = os.path.join(repo_path, "data.txt")
            with open(file_path, "a") as f:
                f.write(f"Commit {j+1}/{num_commits} for {date_str}\n")

            subprocess.run(["git", "add", "."], cwd=repo_path)

            env = os.environ.copy()
            env["GIT_AUTHOR_DATE"] = date_str
            env["GIT_COMMITTER_DATE"] = date_str

            subprocess.run([
                "git", "commit", "-m", f"Commit {j+1}/{num_commits} for {date_str}",
                f"--author={author_name} <{author_email}>"
            ], cwd=repo_path, env=env)

print("All commits created ✅")
print(f"Next: cd {repo_path} && git branch -M main && git remote add origin <your-repo-url> && git push -u origin main --force")
