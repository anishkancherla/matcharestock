#!/usr/bin/env python3
"""
Test Email Notifications Script
Processes pending notifications from restock_notifications table
Perfect for testing email templates without running the full scraper
"""

import os
import sys
import requests
import urllib3
from datetime import datetime
from dotenv import load_dotenv
from config import SCRAPER_API_KEY, API_BASE_URL

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load environment variables
load_dotenv()

class NotificationTester:
    def __init__(self):
        self.api_base_url = API_BASE_URL
        self.api_key = SCRAPER_API_KEY
        
        print("📧 Email Notification Tester")
        print("=" * 50)
        print(f"API Base URL: {self.api_base_url}")
        print(f"Testing email templates by processing pending notifications...")
        print()

    def process_pending_notifications(self):
        """Process all pending notifications in the restock_notifications table"""
        print("🔍 Checking for pending notifications...")
        
        try:
            # Call the process-notifications API endpoint
            api_url = f"{self.api_base_url}/api/process-notifications"
            
            request_kwargs = {
                'json': {
                    "apiKey": self.api_key
                },
                'headers': {'Content-Type': 'application/json'},
                'timeout': 60,
                'verify': False  # Skip SSL verification for localhost/development
            }
            
            response = requests.post(api_url, **request_kwargs)
            
            if response.status_code == 200:
                result = response.json()
                
                print("✅ NOTIFICATION PROCESSING COMPLETE!")
                print("-" * 40)
                print(f"📬 Total pending notifications: {result.get('total_pending', 0)}")
                print(f"📧 Brands notified: {result.get('brands_notified', 0)}")
                print(f"❌ Failures: {result.get('failures', 0)}")
                print()
                
                # Show detailed results
                if result.get('notification_results'):
                    print("📊 DETAILED RESULTS:")
                    print("-" * 20)
                    for notification_result in result['notification_results']:
                        brand = notification_result['brand']
                        products = notification_result.get('products', [])
                        
                        if notification_result['success']:
                            notified = notification_result.get('notified', 0)
                            print(f"✅ {brand}: {notified} emails sent")
                            if products:
                                print(f"   Products: {', '.join(products)}")
                        else:
                            error = notification_result.get('error', 'Unknown error')
                            print(f"❌ {brand}: {error}")
                            if products:
                                print(f"   Products: {', '.join(products)}")
                        print()
                else:
                    print("📭 No notification results to display")
                
                return result.get('brands_notified', 0) > 0
                
            elif response.status_code == 401:
                print("❌ UNAUTHORIZED - Check your API key")
                return False
            else:
                print(f"❌ API ERROR: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            return False

    def add_test_notification(self, brand="Ippodo", product_name="Test Matcha Product"):
        """Add a test notification to the database (for testing purposes)"""
        print(f"🧪 Adding test notification for {brand} - {product_name}")
        
        try:
            # Call the stock-update API to create a test notification
            api_url = f"{self.api_base_url}/api/stock-update"
            
            test_product = {
                "brand": brand,
                "product_name": product_name,
                "is_in_stock": True,  # This should trigger a restock notification
                "stock_status": "in_stock",
                "stock_url": f"https://example.com/test-product",
                "price": "$45.00",
                "confidence": 0.95
            }
            
            request_kwargs = {
                'json': {
                    "products": [test_product],
                    "apiKey": self.api_key
                },
                'headers': {'Content-Type': 'application/json'},
                'timeout': 60,
                'verify': False
            }
            
            response = requests.post(api_url, **request_kwargs)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('restocks_detected', 0) > 0:
                    print(f"✅ Test notification added! Database will create restock entry.")
                    print(f"   Restocks detected: {result.get('restocks_detected', 0)}")
                    return True
                else:
                    print(f"⚠️  No restock detected. Product may already be marked as in stock.")
                    return False
            else:
                print(f"❌ Failed to add test notification: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ ERROR adding test notification: {e}")
            return False

    def run_test(self, add_test_data=False):
        """Run the notification test"""
        print(f"🚀 Starting notification test at {datetime.now().strftime('%H:%M:%S')}")
        print()
        
        if add_test_data:
            print("STEP 1: Adding test data")
            print("-" * 30)
            success = self.add_test_notification()
            if success:
                print("✅ Test data added successfully!")
                print("⏳ Waiting 2 seconds for database triggers...")
                import time
                time.sleep(2)
            else:
                print("❌ Failed to add test data")
            print()
        
        print("STEP 2: Processing notifications")
        print("-" * 30)
        success = self.process_pending_notifications()
        
        print()
        print("=" * 50)
        if success:
            print("🎉 TEST COMPLETE! Check your email for the new template!")
        else:
            print("⚠️  TEST COMPLETE - No notifications were sent")
        print("=" * 50)
        
        return success

def main():
    """Main function"""
    tester = NotificationTester()
    
    args = sys.argv[1:]
    
    if len(args) > 0:
        if args[0] == "--help" or args[0] == "-h":
            print("Usage:")
            print("  python test_notifications.py                    # Process existing notifications")
            print("  python test_notifications.py --add-test-data    # Add test data then process")
            print("  python test_notifications.py --help             # Show this help")
            print()
            print("What this script does:")
            print("  • Processes pending notifications from restock_notifications table")
            print("  • Sends emails using your current email templates")
            print("  • Perfect for testing email template changes")
            print()
            print("Examples:")
            print("  python test_notifications.py                    # Test with existing data")
            print("  python test_notifications.py --add-test-data    # Create test data first")
            return
        elif args[0] == "--add-test-data":
            tester.run_test(add_test_data=True)
        else:
            print(f"Unknown argument: {args[0]}")
            print("Use --help for usage information")
            return
    else:
        # Default: just process existing notifications
        tester.run_test(add_test_data=False)

if __name__ == "__main__":
    main() 