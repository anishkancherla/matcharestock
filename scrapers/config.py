#!/usr/bin/env python3
"""
Configuration for Matcha Scrapers with Residential Proxy Support
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Proxy configuration
PROXY_ENABLED = True
PROXY_URL = 'http://brd-customer-hl_85a4c607-zone-residential_proxy1:z68opcghw7w8@brd.superproxy.io:33335'

# API configuration
API_KEY = '03544c84-926d-4c87-b9c6-24f978c1c463'
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "your-scraper-api-key-here")

def get_proxy_config():
    """Get proxy configuration for requests"""
    if PROXY_ENABLED and PROXY_URL:
        return {
            'http': PROXY_URL,
            'https': PROXY_URL,
        }
    return None

def get_request_kwargs(url: str = None):
    """Get standard request kwargs with proxy and SSL settings"""
    kwargs = {
        'verify': False,  # Disable SSL verification for proxy compatibility
        'timeout': 30,
    }
    
    # Don't use proxy for localhost/local API calls
    if url and ('localhost' in url or '127.0.0.1' in url or url.startswith('http://192.168.')):
        # Local API calls go direct (no proxy)
        kwargs['verify'] = True  # Re-enable SSL verification for local calls
        return kwargs
    
    # External calls (matcha sites) use proxy
    proxy_config = get_proxy_config()
    if proxy_config:
        kwargs['proxies'] = proxy_config
        
    return kwargs

# Test function to verify proxy is working
def test_proxy():
    """Test if the proxy is working"""
    import requests
    import urllib3
    
    # Disable SSL warnings
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    test_url = 'https://geo.brdtest.com/mygeo.json'
    
    try:
        print("Testing proxy connection...")
        print(f"Proxy: {PROXY_URL}")
        
        kwargs = get_request_kwargs(test_url)
        response = requests.get(test_url, **kwargs)
        
        if response.status_code == 200:
            geo_data = response.json()
            print("✅ Proxy working!")
            print(f"   IP: {geo_data.get('ip', 'unknown')}")
            print(f"   Country: {geo_data.get('country', 'unknown')}")
            print(f"   City: {geo_data.get('city', 'unknown')}")
            print(f"   ISP: {geo_data.get('org', 'unknown')}")
            return True
        else:
            print(f"❌ Proxy test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Proxy test error: {e}")
        return False

if __name__ == "__main__":
    test_proxy() 