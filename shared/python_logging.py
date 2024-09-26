import subprocess
import os

def log(level, module, message):
    script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'scripts', 'log.sh')
    subprocess.run([script_path, level, module, message], check=True)

def info(module, message):
    log('INFO', module, message)

def warn(module, message):
    log('WARN', module, message)

def error(module, message):
    log('ERROR', module, message)

# Usage example:
# from shared.python_logging import info, warn, error
# 
# info('my_module', 'This is an info message')
# warn('my_module', 'This is a warning message')
# error('my_module', 'This is an error message')