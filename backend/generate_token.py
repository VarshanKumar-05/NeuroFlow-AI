import sys
import os

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.security import create_access_token
token = create_access_token(data={"sub": "123"})
with open("token.txt", "w", encoding="utf-8") as f:
    f.write(token)
