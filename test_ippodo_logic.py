#!/usr/bin/env python3
"""
Test script to verify Ippodo scraper logic on live products
"""

import sys
sys.path.append('scrapers')

from ippodo_scraper import IppodoScraper

def test_four_products():
    """Test the exact scraper logic on four live products"""
    
    scraper = IppodoScraper()
    
    # Test products
    test_products = [
        {
            'name': 'Horai (Should be OUT OF STOCK)',
            'url': 'https://ippodotea.com/collections/matcha/products/horai-no-mukashi'
        },
        {
            'name': 'Uji Shimizu (Should be IN STOCK)', 
            'url': 'https://ippodotea.com/collections/matcha/products/uji-shimizu'
        },
        {
            'name': 'Gokujo Hojicha (Should be IN STOCK)',
            'url': 'https://ippodotea.com/products/gokujo-hojicha'
        },
        {
            'name': 'Kan (Should be OUT OF STOCK)',
            'url': 'https://ippodotea.com/collections/matcha/products/kan'
        }
    ]
    
    print("🧪 TESTING IPPODO SCRAPER LOGIC")
    print("=" * 60)
    
    for i, product in enumerate(test_products, 1):
        print(f"\n🔍 [{i}/4] Testing: {product['name']}")
        print(f"URL: {product['url']}")
        print("-" * 50)
        
        try:
            # Test just the HTML detection logic
            html_result = scraper.check_html_for_preorder(product['url'])
            
            print(f"📋 HTML Detection Results:")
            print(f"   is_purchase: {html_result.get('is_purchase', False)}")
            print(f"   is_preorder: {html_result.get('is_preorder', False)}")
            print(f"   button_text: {html_result.get('button_text', 'None')}")
            print(f"   indicators: {html_result.get('indicators', [])}")
            
            # Apply the same logic as determine_stock_status
            if html_result.get('is_purchase', False):
                final_status = 'in_stock'
                print(f"   🟢 FINAL: IN_STOCK - Customer can purchase")
                
            elif html_result.get('is_preorder', False):
                final_status = 'pre_order'
                print(f"   🟡 FINAL: PRE_ORDER - Customer can pre-order")
                
            else:
                final_status = 'out_of_stock'
                print(f"   🔴 FINAL: OUT_OF_STOCK - No purchase options")
            
            print(f"   ✅ Status: {final_status.upper()}")
                
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
        
        print()
    
    print("🎯 SUMMARY:")
    print("- If Horai shows OUT_OF_STOCK → Logic is working!")
    print("- If Uji Shimizu shows IN_STOCK → Logic is working!")
    print("- If Gokujo Hojicha shows IN_STOCK → Logic is working!")
    print("- If Kan shows OUT_OF_STOCK → Logic is working!")
    print("- If results are wrong → We need to fix the logic")

if __name__ == "__main__":
    test_four_products()