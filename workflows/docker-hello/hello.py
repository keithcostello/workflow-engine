#!/usr/bin/env python3
"""Complex Hello World - Orchestration Training Demo."""
import sys
from datetime import datetime

def main():
    print("=" * 50)
    print("  Hello from Docker Orchestration Training!")
    print("=" * 50)
    print(f"  Time: {datetime.utcnow().isoformat()}Z")
    print(f"  Python: {sys.version.split()[0]}")
    print("=" * 50)
    return 0

if __name__ == "__main__":
    sys.exit(main())
