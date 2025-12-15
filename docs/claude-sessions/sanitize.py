#!/usr/bin/env python3
"""
Claude Sessions Sanitizer
Removes sensitive information from session markdown files before git commit.
"""

import os
import re
import glob

# Patterns to sanitize
PATTERNS = [
    # Passwords
    (r'PGPASSWORD=[^\s\n]+', 'PGPASSWORD=<REDACTED>'),
    (r'DB_PASSWORD=[^\s\n]+', 'DB_PASSWORD=<REDACTED>'),
    (r'REDIS_PASSWORD=[^\s\n]+', 'REDIS_PASSWORD=<REDACTED>'),
    (r'\$\{REDIS_PASSWORD\}', '<REDACTED>'),

    # JWT Secrets
    (r'JWT_SECRET=[^\s\n]+', 'JWT_SECRET=<REDACTED>'),
    (r'JWT_REFRESH_SECRET=[^\s\n]+', 'JWT_REFRESH_SECRET=<REDACTED>'),

    # API Keys and Tokens
    (r'api[_-]?key["\']?\s*[:=]\s*["\']?[a-zA-Z0-9_-]{20,}["\']?', 'api_key: <REDACTED>', re.IGNORECASE),
    (r'bearer\s+[a-zA-Z0-9._-]+', 'Bearer <REDACTED>', re.IGNORECASE),

    # External IP addresses (keep localhost and private ranges readable)
    (r'http://(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})', lambda m: sanitize_ip_url(m)),
    (r'@//(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):(\d+)', lambda m: sanitize_oracle_ip(m)),
    (r'(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):(\d+)', lambda m: sanitize_ip_port(m)),

    # Redis URLs with password
    (r'redis://:[^@]+@', 'redis://:<REDACTED>@'),

    # Specific test passwords (common patterns)
    (r'admin123!@#', '<TEST_PASSWORD>'),
    (r'password123', '<TEST_PASSWORD>'),
    (r'test123', '<TEST_PASSWORD>'),

    # Database connection strings
    (r'postgres://[^:]+:[^@]+@', 'postgres://<USER>:<REDACTED>@'),
    (r'mongodb://[^:]+:[^@]+@', 'mongodb://<USER>:<REDACTED>@'),

    # Oracle connection strings (user/password@//host:port/service)
    (r'corenext/[^@\s]+@//', 'corenext/<REDACTED>@//'),
    (r'userid=[^/]+/[^\s]+', 'userid=<USER>/<REDACTED>'),
    (r'IDENTIFIED BY "[^"]+"', 'IDENTIFIED BY "<REDACTED>"'),
    (r'IDENTIFIED BY \'[^\']+\'', "IDENTIFIED BY '<REDACTED>'"),

    # DB_password pattern (with colon)
    (r'DB_password:\s*[^\s\n]+', 'DB_password: <REDACTED>'),
]

def is_private_ip(ip_parts):
    """Check if IP is private/local."""
    try:
        a, b, c, d = [int(p) for p in ip_parts]
        # localhost
        if a == 127:
            return True
        # 10.x.x.x
        if a == 10:
            return True
        # 172.16.x.x - 172.31.x.x
        if a == 172 and 16 <= b <= 31:
            return True
        # 192.168.x.x
        if a == 192 and b == 168:
            return True
        # 0.0.0.0
        if a == 0:
            return True
        return False
    except:
        return False

def sanitize_ip_url(match):
    """Sanitize IP in URL, keep private IPs."""
    full = match.group(0)
    ip_parts = [match.group(i) for i in range(1, 5)]
    if is_private_ip(ip_parts):
        return full
    return 'http://<REDACTED_IP>'

def sanitize_ip_port(match):
    """Sanitize IP:port, keep private IPs."""
    full = match.group(0)
    ip_parts = [match.group(i) for i in range(1, 5)]
    port = match.group(5)
    if is_private_ip(ip_parts):
        return full
    return f'<REDACTED_IP>:{port}'

def sanitize_oracle_ip(match):
    """Sanitize Oracle connection IP @//host:port."""
    full = match.group(0)
    ip_parts = [match.group(i) for i in range(1, 5)]
    port = match.group(5)
    if is_private_ip(ip_parts):
        return full
    return f'@//<REDACTED_IP>:{port}'

def sanitize_content(content):
    """Apply all sanitization patterns to content."""
    result = content

    for pattern_tuple in PATTERNS:
        if len(pattern_tuple) == 2:
            pattern, replacement = pattern_tuple
            flags = 0
        else:
            pattern, replacement, flags = pattern_tuple

        if callable(replacement):
            result = re.sub(pattern, replacement, result, flags=flags)
        else:
            result = re.sub(pattern, replacement, result, flags=flags)

    return result

def sanitize_file(filepath):
    """Sanitize a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        sanitized = sanitize_content(content)

        if content != sanitized:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(sanitized)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to sanitize all markdown files."""
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Find all markdown files
    patterns = [
        os.path.join(script_dir, '**', '*.md'),
    ]

    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern, recursive=True))

    modified_count = 0
    for filepath in files:
        if sanitize_file(filepath):
            print(f"Sanitized: {os.path.relpath(filepath, script_dir)}")
            modified_count += 1

    print(f"\nTotal files processed: {len(files)}")
    print(f"Files modified: {modified_count}")

if __name__ == '__main__':
    main()
