#!/usr/bin/env python3
"""
Complete MatchaRestock Monitoring System with Brand-Level Notifications
Combines stock checking, database updates, and brand-level email notifications
"""

import os
import sys
import time
import requests
from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict
from supabase import create_client, Client
from dotenv import load_dotenv

# Import our actual scrapers
from ippodo_scraper import IppodoScraper, get_all_ippodo_products
from marukyu_scraper import MarukyuKoyamaenScraper, get_all_marukyu_products

# Load environment variables from .env file
load_dotenv()

class MatchaRestockMonitor:
    def __init__(self):
        # Supabase Configuration
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        # API Configuration  
        self.api_endpoint = os.getenv("RESTOCK_API_URL")
        self.api_key = os.getenv("SCRAPER_API_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials")
        
        if not self.api_endpoint or not self.api_key:
            raise ValueError("Missing API credentials")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to MatchaRestock database")

    def update_product_stock(self, brand: str, product_name: str, is_in_stock: bool, stock_url: str = None) -> bool:
        """Update product stock status - triggers will handle notifications"""
        try:
            # Check if product already exists
            existing_result = self.supabase.table('product_stock').select('*').eq('brand', brand).eq('product_name', product_name).execute()
            
            current_time = datetime.now().isoformat()
            
            if existing_result.data:
                # Product exists - update it
                existing_product = existing_result.data[0]
                update_data = {
                    'is_in_stock': is_in_stock,
                    'last_checked': current_time,
                    'stock_url': stock_url
                }
                
                # Add stock change timestamp if status is changing to in_stock
                if is_in_stock and not existing_product.get('is_in_stock', False):
                    update_data['stock_change_detected_at'] = current_time
                    print(f"  📈 Stock change detected: {brand} - {product_name}")
                
                result = self.supabase.table('product_stock').update(update_data).eq('id', existing_product['id']).execute()
            else:
                # Product doesn't exist - insert it
                insert_data = {
                    'brand': brand,
                    'product_name': product_name,
                    'is_in_stock': is_in_stock,
                    'last_checked': current_time,
                    'stock_url': stock_url
                }
                
                # If inserting as in stock, mark the change timestamp
                if is_in_stock:
                    insert_data['stock_change_detected_at'] = current_time
                    print(f"  📈 New product in stock: {brand} - {product_name}")
                
                result = self.supabase.table('product_stock').insert(insert_data).execute()
            
            return True
            
        except Exception as e:
            print(f"❌ Error updating {brand} - {product_name}: {e}")
            return False

    def scrape_ippodo_products(self) -> List[Dict]:
        """Real Ippodo scraping using your actual scraper"""
        print("🍵 Checking Ippodo stock...")
        
        try:
            # Use your actual Ippodo scraper
            scraper = IppodoScraper()
            product_urls = get_all_ippodo_products()
            
            print(f"  📦 Found {len(product_urls)} Ippodo products to check")
            
            scraped_results = []
            stock_changes = 0
            
            for i, url in enumerate(product_urls, 1):
                print(f"  🔍 [{i}/{len(product_urls)}] Checking {url.split('/')[-1]}...")
                
                try:
                    result = scraper.scrape_product(url)
                    
                    if result['success']:
                        # Convert scraper result to monitoring system format
                        is_in_stock = result['status'] == 'in_stock'
                        
                        # Update database
                        success = self.update_product_stock(
                            brand="Ippodo",
                            product_name=result['name'],
                            is_in_stock=is_in_stock,
                            stock_url=result['url']
                        )
                        
                        if success and is_in_stock:
                            stock_changes += 1
                        
                        # Convert to expected format
                        product_data = {
                            "name": result['name'],
                            "url": result['url'],
                            "in_stock": is_in_stock,
                            "status": result['status'],
                            "price": result.get('price'),
                            "confidence": result.get('confidence', 0.0)
                        }
                        scraped_results.append(product_data)
                        
                    else:
                        print(f"    ❌ Failed to scrape: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"    ❌ Exception scraping product: {e}")
                
                # Small delay between products
                if i < len(product_urls):
                    time.sleep(2)
            
            print(f"  ✅ Updated {len(scraped_results)} Ippodo products, {stock_changes} potential restocks")
            return scraped_results
            
        except Exception as e:
            print(f"  ❌ Error during Ippodo scraping: {e}")
            return []

    def scrape_marukyu_products(self) -> List[Dict]:
        """Real Marukyu Koyamaen scraping using your actual scraper"""
        print("🍵 Checking Marukyu Koyamaen stock...")
        
        try:
            # Use your actual Marukyu scraper
            scraper = MarukyuKoyamaenScraper()
            product_urls = get_all_marukyu_products()
            
            print(f"  📦 Found {len(product_urls)} Marukyu products to check")
            
            scraped_results = []
            stock_changes = 0
            
            for i, url in enumerate(product_urls, 1):
                print(f"  🔍 [{i}/{len(product_urls)}] Checking {url.split('/')[-1]}...")
                
                try:
                    result = scraper.scrape_product(url)
                    
                    if result['success']:
                        # Convert scraper result to monitoring system format
                        is_in_stock = result['status'] == 'in_stock'
                        
                        # Update database
                        success = self.update_product_stock(
                            brand="Marukyu Koyamaen",
                            product_name=result['name'],
                            is_in_stock=is_in_stock,
                            stock_url=result['url']
                        )
                        
                        if success and is_in_stock:
                            stock_changes += 1
                        
                        # Convert to expected format
                        product_data = {
                            "name": result['name'],
                            "url": result['url'],
                            "in_stock": is_in_stock,
                            "status": result['status'],
                            "price": result.get('price'),
                            "confidence": result.get('confidence', 0.0)
                        }
                        scraped_results.append(product_data)
                        
                    else:
                        print(f"    ❌ Failed to scrape: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"    ❌ Exception scraping product: {e}")
                
                # Small delay between products
                if i < len(product_urls):
                    time.sleep(2)
            
            print(f"  ✅ Updated {len(scraped_results)} Marukyu products, {stock_changes} potential restocks")
            return scraped_results
            
        except Exception as e:
            print(f"  ❌ Error during Marukyu scraping: {e}")
            return []

    def get_pending_notifications(self) -> List[Dict]:
        """Get restock notifications that haven't been sent yet"""
        try:
            # Get notifications from the last hour that haven't been processed
            one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
            
            result = self.supabase.table('restock_notifications').select('*').gte('created_at', one_hour_ago).eq('email_sent', False).gt('subscribers_notified', 0).execute()
            
            if result.data:
                print(f"📬 Found {len(result.data)} pending notifications")
                return result.data
            else:
                return []
                
        except Exception as e:
            print(f"❌ Error fetching pending notifications: {e}")
            return []

    def group_notifications_by_brand(self, notifications: List[Dict]) -> Dict[str, List[Dict]]:
        """Group notifications by brand for batched emails"""
        brand_groups = defaultdict(list)
        
        for notification in notifications:
            brand = notification['brand']
            brand_groups[brand].append(notification)
        
        return dict(brand_groups)

    def send_brand_notification_email(self, brand: str, products: List[Dict]) -> bool:
        """Send restock notification for a brand with multiple products"""
        try:
            # Prepare products list for the email
            product_list = []
            for product in products:
                product_info = {
                    "name": product['product_name'],
                    "url": product.get('product_url', product.get('stock_url', ''))  # Try both field names
                }
                product_list.append(product_info)
            
            payload = {
                "brand": brand,
                "products": product_list,  # Send multiple products
                "apiKey": self.api_key
            }
            
            product_names = [p['product_name'] for p in products]
            print(f"📧 Sending brand notification for {brand}")
            print(f"   Products: {', '.join(product_names)}")
            
            response = requests.post(
                self.api_endpoint,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                subscribers_notified = result.get('notified', 0)
                print(f"✅ Sent to {subscribers_notified} subscribers for {brand}")
                return True
            else:
                print(f"❌ Failed to send: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending notification: {e}")
            return False

    def mark_notifications_sent(self, notification_ids: List[str], success: bool):
        """Mark multiple notifications as processed"""
        try:
            update_data = {
                'email_sent': success,
                'sent_at': datetime.now().isoformat()
            }
            
            # Update all notifications for this brand
            self.supabase.table('restock_notifications').update(update_data).in_('id', notification_ids).execute()
            
            status = "✅ SUCCESS" if success else "❌ FAILED"
            print(f"📝 Marked {len(notification_ids)} notifications as {status}")
            
        except Exception as e:
            print(f"❌ Error updating notification status: {e}")

    def process_pending_notifications(self) -> Dict[str, int]:
        """Process all pending restock notifications, batched by brand"""
        pending = self.get_pending_notifications()
        
        if not pending:
            return {'total_pending': 0, 'brands_notified': 0, 'failures': 0}
        
        # Group notifications by brand
        brand_groups = self.group_notifications_by_brand(pending)
        
        stats = {
            'total_pending': len(pending),
            'brands_notified': 0,
            'failures': 0
        }
        
        print(f"📦 Found restocks for {len(brand_groups)} brands")
        
        for brand, notifications in brand_groups.items():
            print(f"\n🏷️  Processing {brand} ({len(notifications)} products)")
            
            notification_ids = [n['id'] for n in notifications]
            
            # Send one email per brand with all restocked products
            success = self.send_brand_notification_email(brand, notifications)
            
            if success:
                stats['brands_notified'] += 1
            else:
                stats['failures'] += 1
            
            # Mark all notifications for this brand as processed
            self.mark_notifications_sent(notification_ids, success)
            
            # Small delay between brands
            time.sleep(1)
        
        return stats

    def run_monitoring_cycle(self) -> Dict[str, int]:
        """Run one complete monitoring cycle"""
        print(f"🚀 Starting monitoring cycle at {datetime.now()}")
        
        # Step 1: Scrape all brands and update stock
        print("\n📊 STOCK MONITORING")
        print("=" * 30)
        
        ippodo_results = self.scrape_ippodo_products()
        marukyu_results = self.scrape_marukyu_products()
        
        total_products = len(ippodo_results) + len(marukyu_results)
        
        # Small delay to let database triggers process
        print("\n⏳ Waiting for database triggers to process...")
        time.sleep(3)
        
        # Step 2: Process any new notifications
        print("\n📧 NOTIFICATION PROCESSING")
        print("=" * 30)
        
        notification_stats = self.process_pending_notifications()
        
        # Summary
        stats = {
            'products_checked': total_products,
            'brands_notified': notification_stats['brands_notified'],
            'notifications_sent': notification_stats['total_pending'],
            'failures': notification_stats['failures']
        }
        
        print(f"\n📊 CYCLE SUMMARY")
        print(f"🍵 Products checked: {stats['products_checked']}")
        print(f"📧 Brands notified: {stats['brands_notified']}")
        print(f"📬 Notifications processed: {stats['notifications_sent']}")
        print(f"❌ Failures: {stats['failures']}")
        
        return stats

    def run_continuous_monitoring(self, interval_minutes: int = 10):
        """Run continuous monitoring with brand-level notifications"""
        print(f"🔄 Starting continuous monitoring (every {interval_minutes} minutes)")
        print("🎯 Brand-level notifications enabled!")
        
        while True:
            try:
                stats = self.run_monitoring_cycle()
                
                if stats['brands_notified'] > 0:
                    print(f"🎉 Sent notifications for {stats['brands_notified']} brands!")
                
                print(f"😴 Next check in {interval_minutes} minutes...")
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                print("🛑 Monitoring stopped by user")
                break
            except Exception as e:
                print(f"💥 Unexpected error: {e}")
                print(f"⏳ Waiting {interval_minutes} minutes before retry...")
                time.sleep(interval_minutes * 60)

    def run_test_mode(self) -> Dict[str, int]:
        """Run test mode with simulated stock changes to test the complete flow"""
        print("🧪 RUNNING TEST MODE - Simulating stock changes for testing")
        print("=" * 60)
        
        # Test products to force as "in stock"
        test_products = [
            {
                "brand": "Ippodo",
                "product_name": "Ummon 20g",
                "stock_url": "https://ippodotea.com/collections/matcha/products/ummon-no-mukashi-20g"
            },
            {
                "brand": "Ippodo", 
                "product_name": "Sayaka 40g",
                "stock_url": "https://ippodotea.com/collections/matcha/products/sayaka-no-mukashi"
            },
            {
                "brand": "Marukyu Koyamaen",
                "product_name": "Wako",
                "stock_url": "https://www.marukyu-koyamaen.co.jp/english/shop/products/1161020c1"
            }
        ]
        
        print(f"🎯 Simulating {len(test_products)} products coming back in stock...")
        
        # Step 1: Force products to be in stock
        print("\n📦 SIMULATING STOCK CHANGES")
        print("=" * 30)
        
        for product in test_products:
            print(f"  🔄 Forcing {product['brand']} - {product['product_name']} to be IN STOCK")
            success = self.update_product_stock(
                brand=product['brand'],
                product_name=product['product_name'],
                is_in_stock=True,  # Force in stock
                stock_url=product['stock_url']
            )
            
            if success:
                print(f"    ✅ Database updated successfully")
            else:
                print(f"    ❌ Failed to update database")
        
        # Small delay to let database triggers process
        print("\n⏳ Waiting for database triggers to process...")
        time.sleep(5)
        
        # Step 2: Process notifications
        print("\n📧 PROCESSING NOTIFICATIONS")
        print("=" * 30)
        
        notification_stats = self.process_pending_notifications()
        
        # Step 3: Show results
        stats = {
            'test_products': len(test_products),
            'brands_notified': notification_stats['brands_notified'],
            'notifications_sent': notification_stats['total_pending'],
            'failures': notification_stats['failures']
        }
        
        print(f"\n📊 TEST MODE RESULTS")
        print(f"🧪 Test products simulated: {stats['test_products']}")
        print(f"📧 Brands notified: {stats['brands_notified']}")
        print(f"📬 Notifications sent: {stats['notifications_sent']}")
        print(f"❌ Failures: {stats['failures']}")
        
        if stats['brands_notified'] > 0:
            print(f"\n🎉 SUCCESS! Emails should be sent to your subscribers!")
        else:
            print(f"\n⚠️  No notifications sent - check your triggers and subscribers")
        
        return stats

def main():
    """Main function"""
    import sys
    
    print("🍵 MatchaRestock Complete Monitoring System")
    print("🎯 Brand-Level Notifications Enabled")
    print("=" * 50)
    
    try:
        monitor = MatchaRestockMonitor()
        
        # Check command line arguments
        if len(sys.argv) > 1:
            if sys.argv[1] == "--test":
                # Run test mode with simulated stock changes
                stats = monitor.run_test_mode()
                print("\n🧪 Test mode completed!")
                return stats
            elif sys.argv[1] == "--continuous":
                # Run continuous monitoring
                interval = int(sys.argv[2]) if len(sys.argv) > 2 else 10
                monitor.run_continuous_monitoring(interval)
            else:
                print("Usage:")
                print("  python complete_monitoring_system.py                    # Single run with real scraping")
                print("  python complete_monitoring_system.py --test             # Test mode with simulated stock changes")
                print("  python complete_monitoring_system.py --continuous [min] # Continuous monitoring")
                return
        else:
            # Default: single monitoring cycle with real scraping
            stats = monitor.run_monitoring_cycle()
            print("\n✅ Single monitoring cycle completed!")
            return stats
            
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        raise

if __name__ == "__main__":
    main() 