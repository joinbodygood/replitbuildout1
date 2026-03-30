/**
 * Stedi portal browser automation — free production eligibility checks
 * via portal.stedi.com (Basic plan, 100 checks/month included)
 *
 * ─── HOW TO ACTIVATE ─────────────────────────────────────────────────────────
 * Add these Replit Secrets (only needed if STEDI_API_KEY is not set):
 *   STEDI_EMAIL      = linda@bodygoodstudio.com
 *   STEDI_PASSWORD   = <portal password>
 *   STEDI_ACCOUNT_ID = 1b621bea-6ae4-4cc4-a870-7e6df38c4b26   (from portal URL)
 *
 * The automation logs in headlessly, fills the eligibility form, and parses
 * the structured result — all without spending any API credits.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { StediData } from './confidence-engine';
import * as fs from 'fs';
import * as path from 'path';

const CHROMIUM_PATH = process.env.CHROMIUM_PATH
  || '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
const SESSION_FILE = '/tmp/stedi-portal-session.json';
const PORTAL_BASE = 'https://portal.stedi.com';

const STEDI_EMAIL = process.env.STEDI_EMAIL;
const STEDI_PASSWORD = process.env.STEDI_PASSWORD;
const STEDI_ACCOUNT_ID = process.env.STEDI_ACCOUNT_ID;

export function portalCredentialsAvailable(): boolean {
  return !!(STEDI_EMAIL && STEDI_PASSWORD && STEDI_ACCOUNT_ID);
}

function loadSavedSession(): object[] | null {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      if (data.expiry && Date.now() > data.expiry) return null;
      return data.cookies || null;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveSession(cookies: object[]): void {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify({
      cookies,
      expiry: Date.now() + 8 * 60 * 60 * 1000,
    }), 'utf8');
  } catch {
    // ignore
  }
}

function clearSession(): void {
  try { fs.unlinkSync(SESSION_FILE); } catch { /* ok */ }
}

export async function runPortalEligibilityCheck(params: {
  insurerName: string;
  payerId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  dob: string;
}): Promise<StediData | null> {
  if (!portalCredentialsAvailable()) return null;

  const { chromium } = await import('playwright');

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });

    const savedCookies = loadSavedSession();
    if (savedCookies) {
      await context.addCookies(savedCookies as Parameters<typeof context.addCookies>[0]);
    }

    const page = await context.newPage();

    const isLoggedIn = await tryUseExistingSession(page);
    if (!isLoggedIn) {
      const loginOk = await loginToPortal(page, context);
      if (!loginOk) {
        console.warn('[stedi-portal] Login failed');
        return null;
      }
    }

    const result = await submitEligibilityCheck(page, params);
    await browser.close();
    return result;

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[stedi-portal] Automation error:', message);
    await browser.close();
    return null;
  }
}

async function tryUseExistingSession(page: import('playwright').Page): Promise<boolean> {
  if (!loadSavedSession()) return false;
  try {
    await page.goto(`${PORTAL_BASE}/app/healthcare/eligibility?account=${STEDI_ACCOUNT_ID}`, {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    const url = page.url();
    return !url.includes('/login') && !url.includes('/signin');
  } catch {
    return false;
  }
}

async function loginToPortal(
  page: import('playwright').Page,
  context: import('playwright').BrowserContext
): Promise<boolean> {
  try {
    clearSession();
    await page.goto(`${PORTAL_BASE}`, { waitUntil: 'networkidle', timeout: 20000 });

    await page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email" i]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', STEDI_EMAIL!);

    const continueBtn = page.locator('button:has-text("Continue"), button[type="submit"]').first();
    if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', STEDI_PASSWORD!);
    await page.keyboard.press('Enter');

    await page.waitForURL(/portal\.stedi\.com\/app/, { timeout: 20000 });

    const cookies = await context.cookies();
    saveSession(cookies);
    return true;

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[stedi-portal] Login error:', msg);
    return false;
  }
}

async function submitEligibilityCheck(
  page: import('playwright').Page,
  params: {
    insurerName: string;
    payerId: string;
    memberId: string;
    firstName: string;
    lastName: string;
    dob: string;
  }
): Promise<StediData | null> {
  const eligibilityUrl = `${PORTAL_BASE}/app/healthcare/eligibility?account=${STEDI_ACCOUNT_ID}`;

  if (!page.url().includes('/eligibility')) {
    await page.goto(eligibilityUrl, { waitUntil: 'networkidle', timeout: 20000 });
  }

  await page.click('button:has-text("New eligibility check"), button:has-text("eligibility check")');
  await page.waitForTimeout(1500);

  await page.waitForSelector('input[placeholder*="payer" i], input[name*="payer" i], input[aria-label*="payer" i]', { timeout: 8000 });

  const payerInput = page.locator('input[placeholder*="payer" i], input[name*="payer" i], input[aria-label*="payer" i]').first();
  await payerInput.fill(params.payerId);
  await page.waitForTimeout(500);

  const dropdownItem = page.locator(`[role="option"]:has-text("${params.payerId}"), li:has-text("${params.payerId}")`).first();
  if (await dropdownItem.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dropdownItem.click();
  }

  const npiInput = page.locator('input[placeholder*="npi" i], input[name*="npi" i], input[aria-label*="npi" i]').first();
  if (await npiInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await npiInput.fill(process.env.PROVIDER_NPI || '1558788851');
  }

  const memberIdInput = page.locator('input[placeholder*="member" i], input[name*="member_id" i], input[aria-label*="member id" i]').first();
  await memberIdInput.fill(params.memberId);

  const firstNameInput = page.locator('input[placeholder*="first" i], input[name*="first_name" i]').first();
  if (await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await firstNameInput.fill(params.firstName);
  }

  const lastNameInput = page.locator('input[placeholder*="last" i], input[name*="last_name" i]').first();
  if (await lastNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await lastNameInput.fill(params.lastName);
  }

  const dobInput = page.locator('input[placeholder*="birth" i], input[placeholder*="dob" i], input[name*="dob" i], input[name*="date_of_birth" i]').first();
  if (await dobInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    const dobFormatted = params.dob.replace(/-/g, '/');
    await dobInput.fill(dobFormatted);
  }

  const stcInput = page.locator('input[placeholder*="service type" i], input[name*="service_type" i]').first();
  if (await stcInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await stcInput.fill('88');
    const stcOption = page.locator('[role="option"]:has-text("88"), [role="option"]:has-text("Pharmacy")').first();
    if (await stcOption.isVisible({ timeout: 1500 }).catch(() => false)) {
      await stcOption.click();
    }
  }

  await page.click('button[type="submit"]:has-text("Check"), button:has-text("Run check"), button:has-text("Submit")');

  await page.waitForSelector('[data-testid="eligibility-result"], .eligibility-result, [class*="result"], text=Active, text=Inactive', {
    timeout: 30000,
  });

  return parsePortalResult(page, params.insurerName);
}

async function parsePortalResult(
  page: import('playwright').Page,
  insurerName: string
): Promise<StediData> {
  const pageText = await page.innerText('body').catch(() => '');

  const isActive = /\bactive\b/i.test(pageText) && !/\binactive\b/i.test(pageText);

  const deductibleMatch = pageText.match(/deductible[^\d]*\$?([\d,]+(?:\.\d{2})?)/i);
  const deductibleAmount = deductibleMatch ? parseFloat(deductibleMatch[1].replace(',', '')) : undefined;

  const planMatch = pageText.match(/plan(?:\s+name)?[:\s]+([A-Za-z0-9 \-]+)/i);
  const planName = planMatch ? planMatch[1].trim().slice(0, 60) : null;

  return {
    pharmacyBenefitActive: isActive,
    planName,
    payerName: insurerName,
    payerId: null,
    pbm: null,
    generalPaIndicator: false,
    deductible: deductibleAmount !== undefined ? { amount: deductibleAmount, remaining: undefined } : null,
    specialtyNotes: null,
    error: undefined,
  };
}
