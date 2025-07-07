#!/usr/bin/env python3
"""
MatchaRestock API-Only Scraper
Simple HTTP-only scraper that sends results to your Next.js API
"""

import os
import sys
import time
import requests
from datetime import datetime
from typing import List, Dict
from dotenv import load_dotenv

# Import your existing scrapers (keep them unchanged!)
from ippodo_scraper import IppodoScraper, get_all_ippodo_products
from marukyu_scraper import MarukyuKoyamaenScraper, get_all_marukyu_products

# Load environment variables
load_dotenv()

class APIMatchaRestockMonitor:
    def __init__(self):
        # Only need API configuration (no database credentials!)
        self.api_base_url = os.getenv("API_BASE_URL", "http://localhost:3000")
        self.api_key = os.getenv("SCRAPER_API_KEY")
        
        if not self.api_key:
            raise ValueError("Missing SCRAPER_API_KEY environment variable")
        
        print(f"API-Only Scraper initialized")
        print(f"API Base URL: {self.api_base_url}")

    def scrape_ippodo_products(self) -> List[Dict]:
        """Scrape Ippodo products using existing scraper"""
        print("Checking Ippodo stock...")
        
        try:
            scraper = IppodoScraper()
            product_urls = get_all_ippodo_products()
            
            print(f"  Found {len(product_urls)} Ippodo products to check")
            
            scraped_results = []
            
            for i, url in enumerate(product_urls, 1):
                print(f"  [{i}/{len(product_urls)}] Checking {url.split('/')[-1]}...")
                
                try:
                    result = scraper.scrape_product(url)
                    
                    if result['success']:
                        is_in_stock = result['status'] == 'in_stock'
                        
                        product_data = {
                            "brand": "Ippodo",
                            "product_name": result['name'],
                            "is_in_stock": is_in_stock,
                            "stock_url": result['url'],
                            "price": result.get('price'),
                            "confidence": result.get('confidence', 0.0)
                        }
                        scraped_results.append(product_data)
                        
                    else:
                        print(f"    Failed to scrape: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"    Exception scraping product: {e}")
                
                # Small delay between products
                if i < len(product_urls):
                    time.sleep(2)
            
            print(f"  Scraped {len(scraped_results)} Ippodo products")
            return scraped_results
            
        except Exception as e:
            print(f"  Error during Ippodo scraping: {e}")
            return []

    def scrape_marukyu_products(self) -> List[Dict]:
        """Scrape Marukyu products using existing scraper"""
        print("Checking Marukyu Koyamaen stock...")
        
        try:
            scraper = MarukyuKoyamaenScraper()
            product_urls = get_all_marukyu_products()
            
            print(f"  Found {len(product_urls)} Marukyu products to check")
            
            scraped_results = []
            
            for i, url in enumerate(product_urls, 1):
                print(f"  [{i}/{len(product_urls)}] Checking {url.split('/')[-1]}...")
                
                try:
                    result = scraper.scrape_product(url)
                    
                    if result['success']:
                        is_in_stock = result['status'] == 'in_stock'
                        
                        product_data = {
                            "brand": "Marukyu Koyamaen",
                            "product_name": result['name'],
                            "is_in_stock": is_in_stock,
                            "stock_url": result['url'],
                            "price": result.get('price'),
                            "confidence": result.get('confidence', 0.0)
                        }
                        scraped_results.append(product_data)
                        
                    else:
                        print(f"    Failed to scrape: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"    Exception scraping product: {e}")
                
                # Small delay between products
                if i < len(product_urls):
                    time.sleep(2)
            
            print(f"  Scraped {len(scraped_results)} Marukyu products")
            return scraped_results
            
        except Exception as e:
            print(f"  Error during Marukyu scraping: {e}")
            return []

    def send_stock_updates(self, products: List[Dict]) -> bool:
        """Send product updates to the API"""
        if not products:
            print("No products to update")
            return True
            
        print(f"Sending {len(products)} product updates to API...")
        
        try:
            response = requests.post(
                f"{self.api_base_url}/api/stock-update",
                json={
                    "products": products,
                    "apiKey": self.api_key
                },
                headers={'Content-Type': 'application/json'},
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"API Update Success:")
                print(f"   Processed: {result.get('processed', 0)}")
                print(f"   Successful: {result.get('successful', 0)}")
                print(f"   Failed: {result.get('failed', 0)}")
                print(f"   Restocks detected: {result.get('restocks_detected', 0)}")
                return True
            else:
                print(f"API Update Failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Error sending stock updates: {e}")
            return False

    def process_notifications(self) -> bool:
        """Process pending notifications via API"""
        print("Processing pending notifications...")
        
        try:
            response = requests.post(
                f"{self.api_base_url}/api/process-notifications",
                json={
                    "apiKey": self.api_key
                },
                headers={'Content-Type': 'application/json'},
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"Notification Processing Complete:")
                print(f"   Brands notified: {result.get('brands_notified', 0)}")
                print(f"   Total processed: {result.get('total_pending', 0)}")
                print(f"   Failures: {result.get('failures', 0)}")
                
                # Show details if any notifications were sent
                if result.get('notification_results'):
                    for notification_result in result['notification_results']:
                        if notification_result['success']:
                            print(f"   {notification_result['brand']}: {notification_result.get('notified', 0)} emails sent")
                        else:
                            print(f"   {notification_result['brand']}: {notification_result.get('error', 'Unknown error')}")
                
                return True
            else:
                print(f"Notification Processing Failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Error processing notifications: {e}")
            return False

    def run_monitoring_cycle(self) -> Dict[str, any]:
        """Run one complete monitoring cycle via API"""
        print(f"Starting API-only monitoring cycle at {datetime.now()}")
        print("=" * 60)
        
        # Step 1: Scrape all products
        print(f"\nSTOCK MONITORING")
        print("=" * 30)
        
        ippodo_products = self.scrape_ippodo_products()
        marukyu_products = self.scrape_marukyu_products()
        
        all_products = ippodo_products + marukyu_products
        total_products = len(all_products)
        
        # Step 2: Send updates to API
        print(f"\nAPI STOCK UPDATE")
        print("=" * 30)
        
        update_success = self.send_stock_updates(all_products)
        
        if not update_success:
            return {
                'products_scraped': total_products,
                'api_update_success': False,
                'notifications_processed': False,
                'success': False
            }
        
        # Step 3: Wait for database triggers to process (your existing triggers!)
        print("\nWaiting for database triggers to process...")
        time.sleep(5)
        
        # Step 4: Process notifications via API
        print("\nNOTIFICATION PROCESSING") 
        print("=" * 30)
        
        notification_success = self.process_notifications()
        
        # Summary
        stats = {
            'products_scraped': total_products,
            'api_update_success': update_success,
            'notifications_processed': notification_success,
            'success': update_success and notification_success
        }
        
        print(f"\nCYCLE SUMMARY")
        print("=" * 30)
        print(f"Products scraped: {stats['products_scraped']}")
        print(f"API update: {'SUCCESS' if stats['api_update_success'] else 'FAILED'}")
        print(f"Notifications: {'PROCESSED' if stats['notifications_processed'] else 'FAILED'}")
        print(f"Overall: {'SUCCESS' if stats['success'] else 'FAILED'}")
        
        return stats

    def run_continuous_monitoring(self, interval_minutes: int = 1):
        """Run continuous monitoring via API"""
        print(f"Starting continuous API-only monitoring (every {interval_minutes} minutes)")
        print("All notifications handled via your Next.js API!")
        print("=" * 60)
        
        while True:
            try:
                stats = self.run_monitoring_cycle()
                
                if stats['success']:
                    print(f"\nCycle completed successfully!")
                else:
                    print(f"\nCycle completed with errors")
                
                print(f"\nNext check in {interval_minutes} minutes...")
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                print("\nMonitoring stopped by user")
                break
            except Exception as e:
                print(f"\nUnexpected error: {e}")
                print(f"Waiting {interval_minutes} minutes before retry...")
                time.sleep(interval_minutes * 60)

    def run_test_mode(self) -> Dict[str, any]:
        """Run test mode - single cycle for testing"""
        print("RUNNING TEST MODE")
        print("=" * 60)
        
        stats = self.run_monitoring_cycle()
        
        print(f"\nTEST MODE RESULTS")
        print("=" * 30)
        print(f"Products scraped: {stats['products_scraped']}")
        print(f"API update: {'SUCCESS' if stats['api_update_success'] else 'FAILED'}")
        print(f"Notifications: {'PROCESSED' if stats['notifications_processed'] else 'FAILED'}")
        
        if stats['success']:
            print(f"\nSUCCESS! Your API-only system is working!")
        else:
            print(f"\nSome issues detected - check the logs above")
        
        return stats

def main():
    """Main function"""
    print("MatchaRestock API-Only Scraper")
    print("Simple, reliable, easy to deploy!")
    print("=" * 60)
    
    try:
        monitor = APIMatchaRestockMonitor()
        
        # Check command line arguments
        if len(sys.argv) > 1:
            if sys.argv[1] == "--test":
                # Run test mode
                stats = monitor.run_test_mode()
                print("\nTest mode completed!")
                return stats
            elif sys.argv[1] == "--continuous":
                # Run continuous monitoring
                interval = int(sys.argv[2]) if len(sys.argv) > 2 else 1
                monitor.run_continuous_monitoring(interval)
            else:
                print("Usage:")
                print("  python api_scraper.py                    # Single run")
                print("  python api_scraper.py --test             # Test mode")
                print("  python api_scraper.py --continuous [min] # Continuous monitoring")
                return
        else:
            # Default: single monitoring cycle
            stats = monitor.run_monitoring_cycle()
            print("\nSingle monitoring cycle completed!")
            return stats
            
    except Exception as e:
        print(f"Fatal error: {e}")
        raise

if __name__ == "__main__":
    main() 