"""
Reference
---------
https://github.com/steinitzu/celery-singleton
"""


from .exceptions import DuplicateTaskError
from .singleton import Singleton, clear_locks

__version__ = "0.3.1"
