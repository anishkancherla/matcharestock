#!/usr/bin/env python3
"""
HTML-First Ippodo Scraper Fix
Prioritizes what customers see on the website over API data
"""

def check_website_buttons(self, product_url: str) -> Dict[str, any]:
    """
    Check what buttons/options customers actually see on the website
    Priority: Add to cart > Pre-order > Notify me only
    """
    print("   Checking website buttons and options...")
    
    try:
        headers = self.get_random_headers()
        timeout = random.uniform(25, 35)
        
        request_kwargs = get_request_kwargs(product_url)
        request_kwargs.update({
            'headers': headers,
            'timeout': timeout
        })
        response = self.session.get(product_url, **request_kwargs)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        page_text = soup.get_text().lower()
        
        # Look for purchase buttons (highest priority)
        purchase_buttons = []
        preorder_buttons = []
        notification_buttons = []
        
        # Check all interactive elements
        buttons = soup.find_all(['button', 'input', 'a', 'div'])
        
        for element in buttons:
            element_text = element.get_text(strip=True).lower()
            element_classes = ' '.join(element.get('class', [])).lower()
            element_id = element.get('id', '').lower()
            
            full_element_text = f"{element_text} {element_classes} {element_id}"
            
            # 1. HIGHEST PRIORITY: Add to cart/bag buttons
            purchase_indicators = [
                'add to cart', 'add to bag', 'buy now', 'purchase', 
                'add to basket', 'buy it now', 'checkout'
            ]
            
            for indicator in purchase_indicators:
                if indicator in full_element_text:
                    # Check if button is enabled/clickable
                    if not element.get('disabled') and 'disabled' not in element_classes:
                        purchase_buttons.append({
                            'text': element.get_text(strip=True),
                            'indicator': indicator,
                            'enabled': True
                        })
                        print(f"      🛒 PURCHASE BUTTON FOUND: {element.get_text(strip=True)}")
                        break
            
            # 2. MEDIUM PRIORITY: Pre-order buttons
            preorder_indicators = ['pre-order', 'preorder', 'pre order']
            
            for indicator in preorder_indicators:
                if indicator in full_element_text:
                    if not element.get('disabled') and 'disabled' not in element_classes:
                        preorder_buttons.append({
                            'text': element.get_text(strip=True),
                            'indicator': indicator,
                            'enabled': True
                        })
                        print(f"      ⏳ PRE-ORDER BUTTON FOUND: {element.get_text(strip=True)}")
                        break
            
            # 3. LOWEST PRIORITY: Notification buttons
            notification_indicators = [
                'notify me', 'notify when', 'email me', 'back in stock', 
                'restock', 'waitlist', 'email when available'
            ]
            
            for indicator in notification_indicators:
                if indicator in full_element_text:
                    notification_buttons.append({
                        'text': element.get_text(strip=True),
                        'indicator': indicator,
                        'enabled': True
                    })
                    print(f"      📧 NOTIFICATION BUTTON FOUND: {element.get_text(strip=True)}")
                    break
        
        # Check for sold out text
        sold_out_indicators = [
            'sold out', 'out of stock', 'currently unavailable', 
            'temporarily out of stock', 'not available'
        ]
        
        sold_out_found = []
        for indicator in sold_out_indicators:
            if indicator in page_text:
                sold_out_found.append(indicator)
                print(f"      ❌ SOLD OUT TEXT FOUND: {indicator}")
        
        return {
            'purchase_buttons': purchase_buttons,
            'preorder_buttons': preorder_buttons, 
            'notification_buttons': notification_buttons,
            'sold_out_text': sold_out_found,
            'has_purchase_option': len(purchase_buttons) > 0,
            'has_preorder_option': len(preorder_buttons) > 0,
            'has_notification_only': len(notification_buttons) > 0 and len(purchase_buttons) == 0 and len(preorder_buttons) == 0,
            'is_sold_out': len(sold_out_found) > 0
        }
        
    except Exception as e:
        print(f"   Error checking website buttons: {e}")
        return {
            'purchase_buttons': [],
            'preorder_buttons': [],
            'notification_buttons': [],
            'sold_out_text': [],
            'has_purchase_option': False,
            'has_preorder_option': False,
            'has_notification_only': False,
            'is_sold_out': False
        }

def determine_stock_status_html_first(self, product_data: Dict, product_url: str) -> Dict[str, any]:
    """
    NEW: HTML-First stock detection - prioritize what customers see
    """
    print("🌐 HTML-FIRST DETECTION: Checking what customers actually see...")
    
    # Step 1: Check website buttons (what customers can actually do)
    website_check = self.check_website_buttons(product_url)
    
    indicators_found = []
    
    # Step 2: Determine status based on customer-facing options
    if website_check['has_purchase_option']:
        # ✅ Customer can purchase - IN STOCK
        status = 'in_stock'
        confidence = 0.95
        button_text = website_check['purchase_buttons'][0]['text']
        indicators_found.append(f"Purchase button available: {button_text}")
        print("   ✅ IN STOCK - Customer can purchase")
        
    elif website_check['has_preorder_option']:
        # ✅ Customer can pre-order - PRE ORDER  
        status = 'pre_order'
        confidence = 0.95
        button_text = website_check['preorder_buttons'][0]['text']
        indicators_found.append(f"Pre-order button available: {button_text}")
        print("   ⏳ PRE-ORDER - Customer can pre-order")
        
    elif website_check['has_notification_only'] or website_check['is_sold_out']:
        # ❌ Only notifications or sold out - OUT OF STOCK
        status = 'out_of_stock'
        confidence = 0.9
        
        if website_check['notification_buttons']:
            button_text = website_check['notification_buttons'][0]['text']
            indicators_found.append(f"Only notification available: {button_text}")
        
        if website_check['sold_out_text']:
            indicators_found.extend([f"Sold out text: {text}" for text in website_check['sold_out_text']])
            
        print("   ❌ OUT OF STOCK - No purchase options available")
        
    else:
        # ❓ Unclear - fallback to API check
        print("   🤔 UNCLEAR - Falling back to API check...")
        return self.determine_stock_status_api_fallback(product_data, product_url)
    
    # Step 3: Get additional info from API for context
    product = product_data.get('product', {})
    variants = product.get('variants', [])
    
    inventory_details = {
        'detection_method': 'html_first',
        'website_buttons': website_check,
        'api_variants_count': len(variants)
    }
    
    return {
        'status': status,
        'button_text': button_text if 'button_text' in locals() else 'Unknown',
        'confidence': confidence,
        'indicators_found': indicators_found,
        'inventory_details': inventory_details
    }

def determine_stock_status_api_fallback(self, product_data: Dict, product_url: str) -> Dict[str, any]:
    """
    Fallback to API check if HTML is unclear (keep original logic but fixed)
    """
    print("   📊 API FALLBACK: HTML unclear, checking Shopify data...")
    
    product = product_data.get('product', {})
    variants = product.get('variants', [])
    
    available_variants = 0
    total_inventory = 0
    
    for variant in variants:
        variant_available = variant.get('available', False)
        inventory_quantity = variant.get('inventory_quantity', 0)
        
        # FIXED: Only trust Shopify's available flag
        if variant_available:
            available_variants += 1
            
        if inventory_quantity and inventory_quantity > 0:
            total_inventory += inventory_quantity
    
    if available_variants > 0:
        return {
            'status': 'in_stock',
            'button_text': 'Add to bag',
            'confidence': 0.8,  # Lower confidence for API fallback
            'indicators_found': [f"{available_variants} API variants available"],
            'inventory_details': {
                'detection_method': 'api_fallback',
                'available_variants': available_variants,
                'total_inventory': total_inventory
            }
        }
    else:
        return {
            'status': 'out_of_stock', 
            'button_text': 'Sold out',
            'confidence': 0.8,
            'indicators_found': ['No API variants available'],
            'inventory_details': {
                'detection_method': 'api_fallback',
                'available_variants': 0,
                'total_inventory': total_inventory
            }
        }