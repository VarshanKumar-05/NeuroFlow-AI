import os

models_dir = r"D:\placements\Smart traffic\backend\app\models"

for root, _, files in os.walk(models_dir):
    for file in files:
        if file.endswith(".py"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Replace PostgreSQL specific imports with generic ones
            content = content.replace("from sqlalchemy.dialects.postgresql import UUID, JSONB", "from sqlalchemy import Uuid as UUID, JSON as JSONB")
            content = content.replace("from sqlalchemy.dialects.postgresql import UUID", "from sqlalchemy import Uuid as UUID")
            content = content.replace("from sqlalchemy.dialects.postgresql import JSONB", "from sqlalchemy import JSON as JSONB")
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

print("Models updated for SQLite compatibility.")
