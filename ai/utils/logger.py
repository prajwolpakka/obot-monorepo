import logging
import sys
from logging.handlers import RotatingFileHandler
import os

# Compute project directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Logs folder inside the project directory
log_dir = os.path.join(project_root, 'logs')
os.makedirs(log_dir, exist_ok=True)

# Configure the logger
def setup_logger(name, log_file, level=logging.INFO):
    """Function to setup a logger with a file handler and console handler."""
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Create file handler
    file_handler = RotatingFileHandler(log_file, maxBytes=5*1024*1024, backupCount=5)
    file_handler.setLevel(level)

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)

    # Create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    # Add the handlers to the logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger

# Create loggers for different modules
logger = setup_logger('bot-ai-v2', os.path.join(log_dir, 'bot-ai-v2.log'))

# Usage
def log_info(message):
    """Log an info message."""
    logger.info(message)

