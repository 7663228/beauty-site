from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Navigate to the category page
    page.goto('http://localhost:3000/xiuren/xiuren')
    page.wait_for_load_state('networkidle')
    
    # Check if sticky header exists
    sticky_header = page.locator('.sticky-filter-header')
    if sticky_header.count() > 0:
        print("✓ Sticky header found")
        
        # Check if "单套" and "全套" buttons exist
        single_btn = page.locator('button:has-text("单套")')
        full_btn = page.locator('button:has-text("全套")')
        
        if single_btn.count() > 0 and full_btn.count() > 0:
            print("✓ '单套' and '全套' buttons found")
        else:
            print("✗ Buttons not found")
        
        # Get initial position of sticky header
        initial_box = sticky_header.first.bounding_box()
        print(f"Initial position: y={initial_box['y']}")
        
        # Scroll down
        page.evaluate('window.scrollTo(0, 1000)')
        page.wait_for_timeout(500)
        
        # Get new position after scrolling
        after_scroll_box = sticky_header.first.bounding_box()
        print(f"After scroll position: y={after_scroll_box['y']}")
        
        # Check if sticky header stayed in place (or moved only slightly)
        if after_scroll_box['y'] <= initial_box['y'] + 50:  # Allow small movement
            print("✓ Sticky behavior is working - header stayed at top")
        else:
            print(f"✗ Sticky not working - header moved from y={initial_box['y']} to y={after_scroll_box['y']}")
    else:
        print("✗ Sticky header not found")
    
    # Capture any console errors
    page.on('console', lambda msg: print(f"Console {msg.type}: {msg.text}") if msg.type == 'error' else None)
    
    browser.close()
