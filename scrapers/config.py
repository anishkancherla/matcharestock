#!/usr/bin/env python3
"""
Configuration for API-Only Scraper
Simple configuration - only API settings needed
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY")

# Required Environment Variables Check
def check_config():
    """Check if all required environment variables are set"""
    missing = []
    
    if not SCRAPER_API_KEY:
        missing.append("SCRAPER_API_KEY")
    
    if missing:
        print("Missing required environment variables:")
        for var in missing:
            print(f"   - {var}")
        print("\nCreate a .env file with these variables:")
        print("API_BASE_URL=http://localhost:3000")
        print("SCRAPER_API_KEY=your-api-key-here")
        print("\nFor production:")
        print("API_BASE_URL=https://your-app.vercel.app")
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    print(f"Configuration loaded successfully")
    print(f"   API Base URL: {API_BASE_URL}")

if __name__ == "__main__":
    check_config() 