const puppeteer = require('puppeteer-core');

const PAGES = [
  { name: 'Home', url: 'http://localhost:3000/' },
  { name: 'Xiuren Candy', url: 'http://localhost:3000/xiuren/candy' },
  { name: 'Xiuren Xiuren', url: 'http://localhost:3000/xiuren/xiuren' },
];

async function run() {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9223',
  });

  const version = await browser.version();
  console.log(`🔗 Connected to Chrome: ${version}\n`);

  for (const pageInfo of PAGES) {
    console.log(`${'─'.repeat(60)}`);
    console.log(`📊 ${pageInfo.name} (${pageInfo.url})`);
    console.log('─'.repeat(60));

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    try {
      // Clear cookies/cache
      const client = await page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');

      // Navigate
      await page.goto(pageInfo.url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 4000)); // Wait for dynamic content

      // Collect CLS via Performance Observer
      const clsResult = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const shifts = [];
          let totalCls = 0;

          const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const e = entry;
              if (!e.hadRecentInput) {
                totalCls += e.value;
                shifts.push({
                  value: e.value,
                  startTime: e.startTime,
                  sources: e.sources.map(s => ({
                    nodeName: s.node?.nodeName,
                    id: s.node?.id,
                    className: s.node?.className,
                    previousRect: s.previousRect
                      ? { x: s.previousRect.x, y: s.previousRect.y, w: s.previousRect.width, h: s.previousRect.height }
                      : null,
                    currentRect: s.currentRect
                      ? { x: s.currentRect.x, y: s.currentRect.y, w: s.currentRect.width, h: s.currentRect.height }
                      : null,
                  })),
                });
              }
            }
          });

          obs.observe({ type: 'layout-shift', buffered: true });

          setTimeout(() => {
            obs.disconnect();
            resolve({
              cls: Math.round(totalCls * 1000) / 1000,
              count: shifts.length,
              shifts: shifts.map(s => ({
                value: Math.round(s.value * 10000) / 10000,
                startTime: Math.round(s.startTime),
                sources: s.sources,
              })),
            });
          }, 2000);
        });
      });

      console.log(`  CLS: ${clsResult.cls} (${clsResult.count} shifts)\n`);

      if (clsResult.shifts.length > 0) {
        clsResult.shifts.forEach((s, i) => {
          console.log(`  [Shift ${i + 1}] value=${s.value} @ ${s.startTime}ms`);
          s.sources.forEach((src, j) => {
            const node = src.nodeName === 'IMG'
              ? `IMG#${src.id || ''}.${src.className || ''}`
              : `${src.nodeName || '?'}#${src.id || ''}.${src.className || ''}`;
            console.log(`    source: ${node}`);
            if (src.previousRect && src.currentRect) {
              const dx = Math.round(src.currentRect.x - src.previousRect.x);
              const dy = Math.round(src.currentRect.y - src.previousRect.y);
              const dw = Math.round(src.currentRect.w - src.previousRect.w);
              const dh = Math.round(src.currentRect.h - src.previousRect.h);
              console.log(`    move: (${dx},${dy}) size: (${dw},${dh})`);
              console.log(`    from: ${JSON.stringify(src.previousRect)}`);
              console.log(`    to:   ${JSON.stringify(src.currentRect)}`);
            }
          });
        });
      } else {
        console.log('  ✅ No layout shifts detected');
      }

      // Also get LCP
      const lcpResult = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const entries = [];
          const obs = new PerformanceObserver((list) => {
            entries.push(...list.getEntries());
          });
          obs.observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => {
            obs.disconnect();
            const lcp = entries[entries.length - 1];
            resolve(lcp ? {
              time: Math.round(lcp.startTime),
              size: lcp.size,
              element: lcp.element?.tagName || 'N/A',
              url: lcp.url || 'N/A',
            } : null);
          }, 1500);
        });
      });

      if (lcpResult) {
        console.log(`\n  LCP: ${lcpResult.time}ms (${lcpResult.element}, ${lcpResult.size}px)`);
        if (lcpResult.url) console.log(`  LCP resource: ${lcpResult.url}`);
      }

    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }

    await page.close();
  }

  await browser.disconnect();
  console.log('\n✅ Done.');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
