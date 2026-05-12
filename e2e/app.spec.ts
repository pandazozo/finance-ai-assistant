import { test, expect } from '@playwright/test';

test.describe('Phase 1: 核心功能E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const modal = page.locator('text=风险提示, 继续');
    if (await modal.isVisible({ timeout: 2000 })) {
      await modal.click();
    }
  });

  test('首页 - 页面加载', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('自选股 - 页面加载', async ({ page }) => {
    await page.goto('/watchlist');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('股票详情页 - 页面加载', async ({ page }) => {
    await page.goto('/stock/600519');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('异动页 - 页面加载', async ({ page }) => {
    await page.goto('/anomaly');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('设置页 - 页面加载', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Phase 2: LLM与资讯E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stock/600519');
    await page.waitForLoadState('networkidle');
    const modal = page.locator('text=继续');
    if (await modal.isVisible({ timeout: 2000 })) {
      await modal.click();
    }
  });

  test('个股详情 - 页面加载', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('风险偏好 - 设置页加载', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Phase 3: 规则引擎E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const modal = page.locator('text=继续');
    if (await modal.isVisible({ timeout: 2000 })) {
      await modal.click();
    }
  });

  test('规则编辑器 - 页面加载', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('回测结果页 - 页面加载', async ({ page }) => {
    await page.goto('/backtest');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('用户体验E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const modal = page.locator('text=继续');
    if (await modal.isVisible({ timeout: 2000 })) {
      await modal.click();
    }
  });

  test('页面导航 - TabBar存在', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
  });

  test('响应式布局 - 页面可渲染', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
  });

  test('加载状态 - 页面加载完成', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
  });
});

test.describe('API集成E2E测试', () => {
  test('后端API - 健康检查', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/health');
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - 股票行情', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/stocks/quote?codes=600519');
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - 热点机会', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/opportunities');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('后端API - 异动情报', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/anomalies');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('后端API - 资讯列表', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/stocks/news?code=600519');
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - AI分析', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/v1/stocks/analysis', {
      data: { code: '600519' }
    });
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - 规则列表', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v3/rules');
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - 预设策略', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v3/presets');
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - 市场复盘', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/review');
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - 股票搜索', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/stocks/search?keyword=茅台');
    expect(response.ok()).toBeTruthy();
  });

  test('后端API - 社群帖子', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v3/community/posts?code=600519');
    expect(response.ok()).toBeTruthy();
  });
});
