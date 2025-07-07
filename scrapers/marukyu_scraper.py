#!/usr/bin/env python3
"""
Marukyu Koyamaen Stock Scraper
Simple scraper that detects "Add to cart" vs "Out of stock" status
"""

import requests
from bs4 import BeautifulSoup
import time
import random
import re
from datetime import datetime
from typing import Dict, List

class MarukyuKoyamaenScraper:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://www.marukyu-koyamaen.co.jp"
        
    def get_random_headers(self) -> Dict[str, str]:
        """Get randomized headers to appear more human-like"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        ]
        
        return {
            'User-Agent': random.choice(user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.google.com/'
        }

    def extract_product_info(self, soup: BeautifulSoup, url: str) -> Dict[str, any]:
        """Extract basic product information from the page"""
        # Extract product name from h1
        name_elem = soup.find('h1')
        if name_elem:
            name = name_elem.get_text(strip=True)
        else:
            # Fallback to title or other elements
            title_elem = soup.find('title')
            name = title_elem.get_text(strip=True) if title_elem else "Unknown Product"
        
        # Clean up the name
        name = re.sub(r'\s+', ' ', name).strip()
        
        # Try to extract price (look for ¥ symbol)
        price = None
        price_elements = soup.find_all(string=re.compile(r'¥\d+'))
        if price_elements:
            # Extract first price found
            price_match = re.search(r'¥(\d+(?:,\d+)*)', price_elements[0])
            if price_match:
                price_str = price_match.group(1).replace(',', '')
                try:
                    price = int(price_str)
                except ValueError:
                    pass
        
        return {
            'url': url,
            'name': name,
            'price': price,
            'brand': 'Marukyu Koyamaen'
        }

    def check_stock_status(self, soup: BeautifulSoup) -> Dict[str, any]:
        """Check if product is in stock or out of stock - Marukyu Koyamaen simple logic"""
        page_text = soup.get_text().lower()
        indicators_found = []
        
        print("Checking Marukyu Koyamaen stock status...")
        
        # SIMPLE LOGIC: Look for the ONLY difference between in-stock and out-of-stock pages
        out_of_stock_text = 'this product is currently out of stock and unavailable'
        is_out_of_stock = out_of_stock_text in page_text
        
        print(f"   Looking for: '{out_of_stock_text}'")
        print(f"   Found out of stock text: {is_out_of_stock}")
        
        if is_out_of_stock:
            # Product is explicitly marked as out of stock
            status = 'out_of_stock'
            confidence = 0.95
            button_text = "Out of stock"
            indicators_found.append("Found 'This product is currently out of stock and unavailable' text")
            print("   OUT OF STOCK - Explicitly marked as unavailable")
            
        else:
            # No out of stock text = product is available
            status = 'in_stock'
            confidence = 0.95
            button_text = "Available"
            indicators_found.append("No out of stock text found - product is available")
            print("   IN STOCK - No out of stock text detected")
        
        return {
            'status': status,
            'button_text': button_text,
            'confidence': confidence,
            'indicators_found': indicators_found
        }

    def scrape_product(self, url: str) -> Dict[str, any]:
        """Scrape a single Marukyu Koyamaen product page"""
        print(f"\nScraping: {url}")
        
        try:
            # Add random delay
            time.sleep(random.uniform(1, 3))
            
            headers = self.get_random_headers()
            response = self.session.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            print(f"   Page loaded successfully")
            
            # Extract product information
            product_info = self.extract_product_info(soup, url)
            
            # Check stock status
            stock_info = self.check_stock_status(soup)
            
            # Combine results
            result = {
                **product_info,
                **stock_info,
                'scraped_at': datetime.now().isoformat(),
                'success': True,
                'error': None
            }
            
            print(f"   Product: {product_info['name']}")
            if product_info['price']:
                print(f"   Price: ¥{product_info['price']:,}")
            print(f"   Status: {stock_info['status'].upper()}")
            print(f"   Confidence: {stock_info['confidence']:.1%}")
            
            return result
            
        except Exception as e:
            error_msg = f"Error: {e}"
            print(f"   {error_msg}")
            return {
                'url': url,
                'scraped_at': datetime.now().isoformat(),
                'success': False,
                'error': error_msg,
                'status': 'error'
            }

def get_all_marukyu_products():
    """Get all Marukyu Koyamaen product URLs to scrape"""
    return [
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1g36020c1",    # Kiwami Choan
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1141020c1",   # Unkaku  
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1161020c1",   # Wako
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1111020c1",   # Tenju
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1121020c1",   # Choan
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1131020c1",   # Eiju
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1151020c1",   # Kinrin
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1171020c1",   # Yugen
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1181040c1",   # Chigi no Shiro
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/1191040c1",   # Isuzu
        "https://www.marukyu-koyamaen.co.jp/english/shop/products/11a1040c1",   # Aoarashi
    ]

def scrape_all_marukyu_products():
    """Scrape all Marukyu Koyamaen products and return results"""
    print("Starting Marukyu Koyamaen Product Scraper")
    print("=" * 60)
    
    scraper = MarukyuKoyamaenScraper()
    products = get_all_marukyu_products()
    results = []
    
    print(f"Found {len(products)} Marukyu Koyamaen products to scrape")
    print("\n" + "=" * 60)
    
    for i, url in enumerate(products, 1):
        print(f"\n[{i}/{len(products)}] Scraping product...")
        
        try:
            result = scraper.scrape_product(url)
            results.append(result)
            
            if result['success']:
                print(f"   SUCCESS: {result['name']} - {result['status'].upper()}")
            else:
                print(f"   FAILED: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"   EXCEPTION: {e}")
            results.append({
                'url': url,
                'success': False,
                'error': str(e),
                'scraped_at': datetime.now().isoformat()
            })
        
        # Delay between products
        if i < len(products):
            time.sleep(random.uniform(2, 4))
    
    return results

def test_scraper():
    """Test the scraper with all Marukyu Koyamaen products"""
    
    results = scrape_all_marukyu_products()
    
    # Display summary results
    print("\n" + "=" * 60)
    print("MARUKYU KOYAMAEN SCRAPING RESULTS")
    print("=" * 60)
    
    successful = [r for r in results if r.get('success', False)]
    failed = [r for r in results if not r.get('success', False)]
    
    print(f"Successful: {len(successful)}")
    print(f"Failed: {len(failed)}")
    print(f"Total Products: {len(results)}")
    
    if successful:
        print(f"\nStock Status Summary:")
        in_stock = len([r for r in successful if r['status'] == 'in_stock'])
        out_of_stock = len([r for r in successful if r['status'] == 'out_of_stock'])
        
        print(f"   In Stock: {in_stock}")
        print(f"   Out of Stock: {out_of_stock}")
        
        print(f"\nDetailed Results:")
        for result in successful:
            status_label = 'IN STOCK' if result['status'] == 'in_stock' else 'OUT OF STOCK'
            price_str = f"¥{result['price']:,}" if result.get('price') else 'N/A'
            print(f"   [{status_label}] {result['name']} - {price_str} - {result['status'].upper()}")
    
    if failed:
        print(f"\nFailed Products:")
        for result in failed:
            print(f"   • {result['url'].split('/')[-1]}: {result.get('error', 'Unknown error')}")
    
    return results

if __name__ == "__main__":
    test_scraper() 