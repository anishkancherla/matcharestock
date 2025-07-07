#!/usr/bin/env python3
"""
MatchaRestock API-Only Scraper
Simple HTTP-only scraper that sends results to your Next.js API
"""

import os
import sys
import time
import random
import requests
import urllib3
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import List, Dict
from dotenv import load_dotenv
from config import get_request_kwargs, SCRAPER_API_KEY, API_BASE_URL

# Disable SSL warnings for proxy compatibility
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Import your existing scrapers (keep them unchanged!)
from ippodo_scraper import IppodoScraper, get_all_ippodo_products
from marukyu_scraper import MarukyuKoyamaenScraper, get_all_marukyu_products

# Load environment variables
load_dotenv()

class APIMatchaRestockMonitor:
    def __init__(self, use_parallel_scraping=True):
        # Use configuration from config.py (includes proxy settings!)
        self.api_base_url = API_BASE_URL
        self.api_key = SCRAPER_API_KEY
        self.use_parallel_scraping = use_parallel_scraping
        
        print(f"API-Only Scraper with Residential Proxy initialized")
        print(f"API Base URL: {self.api_base_url}")
        print(f"Proxy enabled: {get_request_kwargs().get('proxies') is not None}")
        print(f"Parallel brand scraping: {'ENABLED' if use_parallel_scraping else 'DISABLED'}")

    def scrape_ippodo_products(self) -> List[Dict]:
        """Scrape Ippodo products using existing scraper"""
        print("🟢 [IPPODO THREAD] Starting Ippodo stock check...")
        
        try:
            scraper = IppodoScraper()
            product_urls = get_all_ippodo_products()
            
            # STEALTH: Randomize product order to avoid predictable patterns
            randomized_urls = product_urls.copy()
            random.shuffle(randomized_urls)
            
            print(f"🟢 [IPPODO] Found {len(randomized_urls)} products to check (randomized order)")
            
            scraped_results = []
            
            for i, url in enumerate(randomized_urls, 1):
                print(f"🟢 [IPPODO] [{i}/{len(randomized_urls)}] Checking {url.split('/')[-1]}...")
                
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
                        print(f"🟢 [IPPODO]    Failed to scrape: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"🟢 [IPPODO]    Exception scraping product: {e}")
                
                # STEALTH: Reduced delays for faster parallel processing
                if i < len(randomized_urls):
                    base_delay = random.uniform(2, 4)  # Reduced from 4-8 seconds
                    # Add extra delay for first few products (mimic human hesitation)
                    if i <= 2:  # Reduced from 3 to 2
                        base_delay += random.uniform(0.5, 1.5)  # Reduced extra delay
                    time.sleep(base_delay)
            
            print(f"🟢 [IPPODO] Completed! Scraped {len(scraped_results)} products")
            return scraped_results
            
        except Exception as e:
            print(f"🟢 [IPPODO] Error during scraping: {e}")
            return []

    def scrape_marukyu_products(self) -> List[Dict]:
        """Scrape Marukyu products using existing scraper"""
        print("🔵 [MARUKYU THREAD] Starting Marukyu stock check...")
        
        try:
            scraper = MarukyuKoyamaenScraper()
            product_urls = get_all_marukyu_products()
            
            # STEALTH: Randomize product order to avoid predictable patterns
            randomized_urls = product_urls.copy()
            random.shuffle(randomized_urls)
            
            print(f"🔵 [MARUKYU] Found {len(randomized_urls)} products to check (randomized order)")
            
            scraped_results = []
            
            for i, url in enumerate(randomized_urls, 1):
                print(f"🔵 [MARUKYU] [{i}/{len(randomized_urls)}] Checking {url.split('/')[-1]}...")
                
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
                        print(f"🔵 [MARUKYU]    Failed to scrape: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"🔵 [MARUKYU]    Exception scraping product: {e}")
                
                # STEALTH: Reduced delays for faster parallel processing
                if i < len(randomized_urls):
                    base_delay = random.uniform(2, 4)  # Reduced from 4-8 seconds
                    # Add extra delay for first few products (mimic human hesitation)
                    if i <= 2:  # Reduced from 3 to 2
                        base_delay += random.uniform(0.5, 1.5)  # Reduced extra delay
                    time.sleep(base_delay)
            
            print(f"🔵 [MARUKYU] Completed! Scraped {len(scraped_results)} products")
            return scraped_results
            
        except Exception as e:
            print(f"🔵 [MARUKYU] Error during scraping: {e}")
            return []

    def scrape_all_brands_parallel(self) -> List[Dict]:
        """Scrape both brands in parallel for maximum speed"""
        print("🚀 PARALLEL SCRAPING: Starting both brands simultaneously...")
        start_time = time.time()
        
        # Use ThreadPoolExecutor to run both brands concurrently
        with ThreadPoolExecutor(max_workers=2, thread_name_prefix="Brand") as executor:
            # Submit both scraping tasks
            ippodo_future = executor.submit(self.scrape_ippodo_products)
            marukyu_future = executor.submit(self.scrape_marukyu_products)
            
            # Collect results as they complete
            all_products = []
            
            for future in as_completed([ippodo_future, marukyu_future]):
                try:
                    products = future.result(timeout=300)  # 5 minute timeout per brand
                    all_products.extend(products)
                except Exception as e:
                    print(f"❌ Thread execution error: {e}")
        
        elapsed_time = time.time() - start_time
        print(f"🚀 PARALLEL SCRAPING COMPLETE!")
        print(f"   Total time: {elapsed_time:.1f} seconds ({elapsed_time/60:.1f} minutes)")
        print(f"   Products scraped: {len(all_products)} total")
        print(f"   Speed improvement: ~50% faster than sequential scraping")
        
        return all_products

    def send_stock_updates(self, products: List[Dict]) -> bool:
        """Send product updates to the API"""
        if not products:
            print("No products to update")
            return True
            
        print(f"Sending {len(products)} product updates to API...")
        
        try:
            # Get configuration for API calls (no proxy for localhost)
            api_url = f"{self.api_base_url}/api/stock-update"
            request_kwargs = get_request_kwargs(api_url)
            request_kwargs.update({
                'json': {
                    "products": products,
                    "apiKey": self.api_key
                },
                'headers': {'Content-Type': 'application/json'},
                'timeout': 60
            })
            
            response = requests.post(api_url, **request_kwargs)
            
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
            # Get configuration for API calls (no proxy for localhost)
            api_url = f"{self.api_base_url}/api/process-notifications"
            request_kwargs = get_request_kwargs(api_url)
            request_kwargs.update({
                'json': {
                    "apiKey": self.api_key
                },
                'headers': {'Content-Type': 'application/json'},
                'timeout': 60
            })
            
            response = requests.post(api_url, **request_kwargs)
            
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
        
        if self.use_parallel_scraping:
            # PARALLEL: Scrape both brands simultaneously (faster!)
            all_products = self.scrape_all_brands_parallel()
        else:
            # SEQUENTIAL: Original method with brand alternation
            print("[SEQUENTIAL] Using original stealth timing")
            if random.choice([True, False]):
                print("[STEALTH] Checking Ippodo first, then Marukyu")
                ippodo_products = self.scrape_ippodo_products()
                time.sleep(random.uniform(5, 15))
                marukyu_products = self.scrape_marukyu_products()
            else:
                print("[STEALTH] Checking Marukyu first, then Ippodo")
                marukyu_products = self.scrape_marukyu_products()
                time.sleep(random.uniform(5, 15))
                ippodo_products = self.scrape_ippodo_products()
            
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
        
        # STEALTH: If restocks detected, wait longer (mimics human excitement/verification)
        restocks_detected = len([p for p in all_products if p.get('is_in_stock', False)])
        if restocks_detected > 0:
            extra_wait = random.uniform(10, 20)  # 10-20 seconds extra for restocks
            print(f"[STEALTH] Found {restocks_detected} in-stock items, adding human-like verification delay")
            time.sleep(5 + extra_wait)
        else:
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

    def run_continuous_monitoring(self, base_interval_minutes: int = 5):
        """Run continuous monitoring with anti-detection measures"""
        print(f"Starting STEALTH monitoring (base interval: {base_interval_minutes} minutes)")
        print("Advanced anti-detection: randomized intervals, quiet hours, pattern obfuscation")
        print("=" * 80)
        
        cycle_count = 0
        
        while True:
            try:
                cycle_count += 1
                current_hour = datetime.now().hour
                
                # Implement "quiet hours" (reduce frequency during low-traffic times)
                if 2 <= current_hour <= 6:  # 2 AM - 6 AM (low web traffic)
                    quiet_multiplier = 3  # 3x longer intervals during quiet hours
                    print(f"[QUIET HOURS] Reduced monitoring frequency")
                else:
                    quiet_multiplier = 1
                
                # Dynamic interval randomization (varies between 80%-150% of base)
                min_interval = base_interval_minutes * 0.8 * quiet_multiplier
                max_interval = base_interval_minutes * 1.5 * quiet_multiplier
                actual_interval = random.uniform(min_interval, max_interval)
                
                print(f"\n[CYCLE {cycle_count}] Starting monitoring at {datetime.now().strftime('%H:%M:%S')}")
                
                stats = self.run_monitoring_cycle()
                
                if stats['success']:
                    print(f"✅ Cycle completed successfully!")
                else:
                    print(f"⚠️ Cycle completed with errors")
                
                # Add extra delay if we've been running for a while (pattern breaking)
                if cycle_count % 10 == 0:  # Every 10th cycle
                    extra_delay = random.uniform(60, 300)  # 1-5 minute extra delay
                    print(f"[PATTERN BREAK] Adding extra {extra_delay/60:.1f} minute delay")
                    actual_interval += extra_delay / 60
                
                print(f"💤 Next check in {actual_interval:.1f} minutes...")
                time.sleep(actual_interval * 60)
                
            except KeyboardInterrupt:
                print("\nMonitoring stopped by user")
                break
            except Exception as e:
                print(f"\nUnexpected error: {e}")
                print(f"Waiting {base_interval_minutes} minutes before retry...")
                time.sleep(base_interval_minutes * 60)

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
    
    # Check for parallel/sequential mode flags
    use_parallel = True  # Default to parallel for speed
    args = sys.argv[1:]
    
    if '--sequential' in args:
        use_parallel = False
        args.remove('--sequential')
        print("🐌 SEQUENTIAL MODE: Using original timing (slower but more stealth)")
    elif '--parallel' in args:
        use_parallel = True  
        args.remove('--parallel')
        print("🚀 PARALLEL MODE: Using simultaneous scraping (faster)")
    
    try:
        monitor = APIMatchaRestockMonitor(use_parallel_scraping=use_parallel)
        
        # Check command line arguments
        if len(args) > 0:
            if args[0] == "--test":
                # Run test mode
                stats = monitor.run_test_mode()
                print("\nTest mode completed!")
                return stats
            elif args[0] == "--continuous":
                # Run continuous monitoring
                interval = int(args[1]) if len(args) > 1 else 5
                monitor.run_continuous_monitoring(interval)
            elif args[0] == "--stealth":
                # Run stealth monitoring (optimized for fast, undetectable monitoring)
                interval = int(args[1]) if len(args) > 1 else 3
                print("🥷 STEALTH MODE: Ultra-fast monitoring with maximum anti-detection")
                print(f"🎯 Target interval: {interval} minutes (with randomization)")
                print("⚡ Perfect for 15-minute sellout windows!")
                monitor.run_continuous_monitoring(interval)
            else:
                print("Usage:")
                print("  python api_scraper.py                        # Single run (parallel)")
                print("  python api_scraper.py --test                 # Test mode (parallel)")
                print("  python api_scraper.py --continuous [min]     # Normal monitoring")
                print("  python api_scraper.py --stealth [min]        # STEALTH: Fast + undetectable")
                print("")
                print("Speed options (add to any command):")
                print("  --parallel     # Default: Scrape brands simultaneously (faster)")
                print("  --sequential   # Original: Scrape brands one after another (slower)")
                print("")
                print("Examples:")
                print("  python api_scraper.py --test --parallel      # Fast test")
                print("  python api_scraper.py --stealth 3 --sequential # Slow stealth")
                print("")
                print("🥷 STEALTH mode features:")
                print("   • Randomized intervals (80%-150% of target)")
                print("   • Product order randomization")
                print("   • Quiet hours (3x slower 2-6 AM)")
                print("   • Pattern breaking every 10 cycles")
                print("   • Human-like response delays")
                print("🚀 PARALLEL mode features:")
                print("   • 50% faster scraping (both brands simultaneously)")
                print("   • Reduced delays between products")
                print("   • Same stealth features maintained")
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