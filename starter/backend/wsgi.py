import sys
import os

# Add the current directory to sys.path so Python can find __init__.py as part of the module
sys.path.insert(0, os.path.dirname(__file__))

from __init__ import app  # noqa: E402

if __name__ == "__main__":
    app.run()
