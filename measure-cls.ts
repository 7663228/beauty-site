import { chromium, Browser, Page } from '@playwright/test';
import { URL } from 'url';

const BASE_URL = 'http://localhost:3000';

const PAGES_TO_TEST = [
  { name: 'Home', path: '/' },
  { name: 'Xiuren Candy', path: '/xiuren/candy' },
  { name: 'Xiuren Xiuren', path: '/xiuren/xiuren' },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const browserContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  console.log('🚀 Running CLS measurement via WebPageTest-like approach\n');

  for (const { name, path } of PAGES_TO_TEST) {
    const page = await browserContext.newPage();
    const url = BASE_URL + path;
    console.log(`\n📊 Testing: ${name} (${url})`);

    try {
      // Clear cache
      await page.goto('about:blank');
      await page.context().clearCookies();

      // Navigate and wait for full load
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait a bit more for dynamic content to settle
      await page.waitForTimeout(3000);

      // Collect CLS data using Performance Observer API
      const clsData = await page.evaluate(() => {
        return new Promise<{ cls: number; layoutShifts: any[] }>((resolve) => {
          let cls = 0;
          const layoutShifts: any[] = [];

          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
                layoutShifts.push({
                  value: (entry as any).value,
                  hadRecentInput: (entry as any).hadRecentInput,
                  startTime: (entry as any).startTime,
                  sources: (entry as any).sources,
                });
              }
            }
          });

          observer.observe({ type: 'layout-shift', buffered: true });

          // Also get existing entries
          const entries = performance.getEntriesByType('layout-shift') as any[];
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
              layoutShifts.push({
                value: entry.value,
                hadRecentInput: entry.hadRecentInput,
                startTime: entry.startTime,
                sources: entry.sources,
              });
            }
          }

          // Wait a bit then resolve
          setTimeout(() => {
            observer.disconnect();
            resolve({ cls: Math.round(cls * 1000) / 1000, layoutShifts });
          }, 2000);
        });
      });

      console.log(`  ✅ CLS Score: ${clsData.cls}`);
      if (clsData.layoutShifts.length > 0) {
        console.log(`  ⚠️  Layout shifts detected: ${clsData.layoutShifts.length}`);
        clsData.layoutShifts.forEach((shift, i) => {
          console.log(`     [${i + 1}] value=${shift.value.toFixed(4)} startTime=${shift.startTime.toFixed(0)}ms`);
          if (shift.sources) {
            shift.sources.forEach((source: any, j: number) => {
              console.log(`         source[${j}]: node=${source.node?.nodeName || 'N/A'}, class=${source.node?.className || 'N/A'}`);
            });
          }
        });
      } else {
        console.log(`  ✅ No layout shifts`);
      }

      // Get Core Web Vitals from Performance API
      const perfMetrics = await page.evaluate(() => {
        const timing = performance.getEntriesByType('navigation')[0] as any;
        return {
          domContentLoaded: Math.round(timing?.domContentLoadedEventEnd - timing?.startTime),
          load: Math.round(timing?.loadEventEnd - timing?.startTime),
          firstPaint: 0,
          fcp: 0,
        };
      });

      // Get LCP candidate
      const lcpEntry = await page.evaluate(() => {
        const entries = performance.getEntriesByType('largest-contentful-paint') as any[];
        if (entries.length === 0) return null;
        const last = entries[entries.length - 1];
        return {
          time: Math.round(last.startTime),
          element: last.element?.tagName || 'N/A',
        };
      });

      console.log(`  📈 Load: ${perfMetrics.load}ms | LCP: ${lcpEntry?.time || '?'}ms (${lcpEntry?.element})`);

      // Get render-blocking resources
      const blockingResources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as any[];
        return resources
          .filter(r => r.initiatorType === 'link' || r.initiatorType === 'script')
          .map(r => ({
            name: r.name,
            type: r.initiatorType,
            duration: Math.round(r.responseEnd - r.startTime),
            size: r.transferSize,
          }))
          .filter(r => r.duration > 100)
          .slice(0, 5);
      });

      if (blockingResources.length > 0) {
        console.log(`  🔴 Blocking resources (>100ms):`);
        blockingResources.forEach(r => {
          console.log(`     ${r.type}: ${r.name.substring(0, 80)} (${r.duration}ms)`);
        });
      }

    } catch (err: any) {
      console.log(`  ❌ Error: ${err.message}`);
    }

    await page.close();
  }

  await browserContext.close();
  await browser.close();
  console.log('\n✅ Done.');
}

run().catch(console.error);
