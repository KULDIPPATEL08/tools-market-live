import ipaddress
import socket
import urllib.parse
from typing import Tuple
from backend.app.core.config import settings

BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "instance-data",
    "169.254.169.254",
}

def is_safe_url(url: str) -> Tuple[bool, str]:
    """
    Validates a URL against SSRF vulnerabilities:
    - Verifies protocol is http or https
    - Checks against blacklisted hostnames
    - Resolves DNS and verifies IP is not private, loopback, link-local, or reserved
    """
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception as e:
        return False, f"Invalid URL structure: {e}"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported protocol '{parsed.scheme}'. Only http and https are allowed."

    hostname = parsed.hostname
    if not hostname:
        return False, "URL does not contain a valid hostname."

    hostname_lower = hostname.lower()
    if hostname_lower in BLOCKED_HOSTNAMES:
        return False, f"Access to '{hostname}' is restricted for security reasons."

    if settings.ALLOW_PRIVATE_IPS:
        return True, ""

    # Resolve hostname to IP
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
        for item in addr_info:
            ip_str = item[4][0]
            ip = ipaddress.ip_address(ip_str)
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
            ):
                return False, f"URL resolves to restricted IP address: {ip_str}"
    except socket.gaierror:
        return False, f"Unable to resolve hostname '{hostname}'"
    except Exception as e:
        return False, f"Error validating URL security: {e}"

    return True, ""

