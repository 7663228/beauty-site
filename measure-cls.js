const { chromium } = require('@playwright/test');
const lighthouse = require('lighthouse');
const { URL } = require('url');

const PAGES = [
  { name: 'Home', url: 'http://localhost:3000/' },
  { name: 'Xiuren Candy', url: 'http://localhost:3000/xiuren/candy' },
  { name: 'Xiuren Xiuren', url: 'http://localhost:3000/xiuren/xiuren' },
];

const LAUNCH_TIMEOUT = 120000;

async function run() {
  console.log('🔍 Starting CLS measurement via Lighthouse + Playwright Chromium\n');

  const browser = await chromium.launch({
    headless: true,
    timeout: LAUNCH_TIMEOUT,
  });

  for (const pageInfo of PAGES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Testing: ${pageInfo.name} (${pageInfo.url})`);
    console.log('='.repeat(60));

    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 720 });

      const { port, version } = await page.context().newCDPSession(page).then(async (session) => {
        const v = await session.send('Browser.getVersion');
        const p = new URL(page.url()).port || 'unknown';
        return { port: p, version: v.userAgent };
      });

      const options = {
        port: 9222,
        onlyCategories: ['performance'],
        throttlingMethod: 'simulate',
        settings: {
          formFactor: 'desktop',
          screenEmulation: { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false },
          onlyCategories: ['performance'],
        },
      };

      const runnerResult = await lighthouse(pageInfo.url, options, undefined);

      const report = runnerResult?.report?.[0];
      if (!report) {
        console.log('  ❌ No report generated');
        await page.close();
        continue;
      }

      const json = JSON.parse(report);

      // Extract CLS
      const clsAudits = json.audits?.['cumulative-layout-shift'];
      const clsValue = clsAudits?.details?.items?.[0]?.overallSavingsMs / 1000 || 0;
      const clsNumeric = clsAudits?.numericValue || 0;
      const clsScore = clsAudits?.score || 0;

      console.log(`\n  🎯 CLS Score (Lighthouse): ${clsNumeric.toFixed(4)}`);
      console.log(`  📈 Lighthouse Score: ${(clsScore * 100).toFixed(1)} / 100`);

      // Layout shift details
      if (clsAudits?.details?.items?.[0]?.breakdown) {
        console.log(`\n  ⚠️  Layout Shift Breakdown:`);
        clsAudits.details.items[0].breakdown.forEach((item, i) => {
          const node = item.node?.nodeLabel || item.node?.selector || 'unknown';
          console.log(`     [${i + 1}] Node: ${node}`);
          console.log(`         Cumulative shift: ${item.cumulativeLayoutShiftDelta?.toFixed(4) || 'N/A'}`);
          console.log(`         Weight: ${item.weight?.toFixed(2) || 'N/A'}`);
          if (item.node?.explanation) {
            console.log(`         Cause: ${item.node.explanation}`);
          }
        });
      }

      // LCP
      const lcp = json.audits?.['largest-contentful-paint'];
      console.log(`\n  🖼️  LCP: ${lcp?.numericValue ? (lcp.numericValue / 1000).toFixed(2) + 's' : 'N/A'} | Score: ${lcp?.score !== undefined ? (lcp.score * 100).toFixed(0) : 'N/A'}/100`);

      // FCP
      const fcp = json.audits?.['first-contentful-paint'];
      console.log(`  🎨 FCP: ${fcp?.numericValue ? (fcp.numericValue / 1000).toFixed(2) + 's' : 'N/A'} | Score: ${fcp?.score !== undefined ? (fcp.score * 100).toFixed(0) : 'N/A'}/100`);

      // TBT
      const tbt = json.audits?.['total-blocking-time'];
      console.log(`  ⏱️  TBT: ${tbt?.numericValue ? tbt.numericValue + 'ms' : 'N/A'} | Score: ${tbt?.score !== undefined ? (tbt.score * 100).toFixed(0) : 'N/A'}/100`);

      // Speed Index
      const si = json.audits?.['speed-index'];
      console.log(`  📊 Speed Index: ${si?.numericValue ? (si.numericValue / 1000).toFixed(2) + 's' : 'N/A'} | Score: ${si?.score !== undefined ? (si.score * 100).toFixed(0) : 'N/A'}/100`);

      // Render blocking
      const rb = json.audits?.['render-blocking-resources'];
      if (rb?.details?.items?.length > 0) {
        console.log(`\n  🔴 Render-blocking resources:`);
        rb.details.items.forEach((r, i) => {
          console.log(`     [${i + 1}] ${r.url?.substring(0, 100)} (${r.wastedMs}ms)`);
        });
      }

      // Unsized images
      const ui = json.audits?.['unsized-images'];
      if (ui?.details?.items?.length > 0) {
        console.log(`\n  🖼️  Unsized images:`);
        ui.details.items.forEach((img, i) => {
          console.log(`     [${i + 1}] ${img.node?.selector || img.url}`);
        });
      }

      // Expensive CSS
      const css = json.audits?.['unused-css-rules'];
      if (css?.details?.items?.length > 0) {
        console.log(`\n  🎨 Unused CSS:`);
        css.details.items.slice(0, 5).forEach((c, i) => {
          console.log(`     [${i + 1}] ${c.url?.substring(0, 80)} (${c.wastedBytes} bytes)`);
        });
      }

      await page.close();
    } catch (err) {
      console.log(`\n  ❌ Error: ${err.message}`);
      try { await page?.close(); } catch { /* ignore */ }
    }
  }

  await browser.close();
  console.log('\n✅ Measurement complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
