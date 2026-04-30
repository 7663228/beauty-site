from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture console messages
    console_messages = []
    page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
    
    # Capture page errors
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    
    print("Navigating to https://beautymodel.com.cn/...")
    page.goto('https://beautymodel.com.cn/', wait_until='networkidle', timeout=30000)
    
    print("\n=== Page loaded ===")
    print(f"Title: {page.title()}")
    
    # Wait a bit for any lazy-loaded content
    time.sleep(2)
    
    # Try to find and click the register button
    print("\n=== Looking for register button ===")
    
    # Try various selectors
    selectors_to_try = [
        'button:has-text("注册")',
        '.btn-reg',
        'button:has-text("立即注册")',
        '[class*="btn-reg"]',
        'text=注册',
    ]
    
    found_button = None
    for selector in selectors_to_try:
        try:
            buttons = page.locator(selector).all()
            print(f"\nSelector '{selector}' found {len(buttons)} elements:")
            for i, btn in enumerate(buttons):
                try:
                    visible = btn.is_visible()
                    text = btn.inner_text()
                    print(f"  [{i}] text='{text[:50]}...' visible={visible}")
                    if visible and found_button is None:
                        found_button = btn
                except Exception as e:
                    print(f"  [{i}] Error: {e}")
        except Exception as e:
            print(f"Selector '{selector}' error: {e}")
    
    if found_button:
        print(f"\n=== Clicking register button ===")
        try:
            found_button.click(timeout=5000)
            print("Button clicked successfully!")
            time.sleep(2)
            
            # Check if modal appeared
            modals = page.locator('.ant-modal').all()
            print(f"Modal count after click: {len(modals)}")
            for i, modal in enumerate(modals):
                try:
                    visible = modal.is_visible()
                    print(f"  Modal [{i}] visible: {visible}")
                except:
                    pass
        except Exception as e:
            print(f"Error clicking button: {e}")
    else:
        print("\nNo visible register button found!")
    
    # Print console messages
    if console_messages:
        print("\n=== Console Messages ===")
        for msg in console_messages:
            print(msg)
    
    # Print page errors
    if page_errors:
        print("\n=== Page Errors ===")
        for err in page_errors:
            print(err)
    
    browser.close()
