/**
 * scripts/verify-deployment.ts
 *
 * Script verifikasi deployment Vercel untuk LUMIÈRE SKIN.
 * Jalankan setelah deployment selesai:
 *
 *   npx ts-node --project tsconfig.scripts.json scripts/verify-deployment.ts
 *
 * Ganti VERCEL_URL dengan URL deployment Anda.
 */

const VERCEL_URL = process.env.VERCEL_URL || "https://lumiere-skin.vercel.app";

interface CheckResult {
  name:    string;
  passed:  boolean;
  message: string;
}

async function check(
  name: string,
  url: string,
  validator: (res: Response, json: unknown) => boolean,
  expectStatus = 200
): Promise<CheckResult> {
  try {
    const res  = await fetch(url);
    const json = await res.json().catch(() => null);
    const ok   = res.status === expectStatus && validator(res, json);
    return { name, passed: ok, message: ok ? `${res.status} OK` : `Status ${res.status}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name, passed: false, message: msg };
  }
}

async function main() {
  console.log(`\n🚀 Verifikasi Deployment LUMIÈRE SKIN`);
  console.log(`   URL: ${VERCEL_URL}\n`);

  const results: CheckResult[] = [];

  // 1. Homepage
  results.push(await check(
    "Homepage dapat diakses",
    VERCEL_URL,
    (res) => res.status === 200,
  ));

  // 2. GET /api/categories
  results.push(await check(
    "GET /api/categories",
    `${VERCEL_URL}/api/categories`,
    (_, json: unknown) => {
      const j = json as { success?: boolean; data?: { categories?: unknown[] } };
      return j?.success === true && Array.isArray(j?.data?.categories);
    }
  ));

  // 3. GET /api/products
  results.push(await check(
    "GET /api/products",
    `${VERCEL_URL}/api/products`,
    (_, json: unknown) => {
      const j = json as { success?: boolean; data?: { products?: unknown[]; total?: number } };
      return j?.success === true && Array.isArray(j?.data?.products) && (j?.data?.total ?? 0) > 0;
    }
  ));

  // 4. GET /api/products/:slug
  results.push(await check(
    "GET /api/products/:slug",
    `${VERCEL_URL}/api/products/vitamin-c-brightening-serum`,
    (_, json: unknown) => {
      const j = json as { success?: boolean; data?: { product?: { name?: string } } };
      return j?.success === true && typeof j?.data?.product?.name === "string";
    }
  ));

  // 5. GET /api/products/invalid → 404
  results.push(await check(
    "GET /api/products/invalid-id → 404",
    `${VERCEL_URL}/api/products/id-tidak-ada-xyz`,
    (_, json: unknown) => {
      const j = json as { success?: boolean };
      return j?.success === false;
    },
    404
  ));

  // 6. POST /api/auth/login (valid)
  const loginRes = await fetch(`${VERCEL_URL}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ identifier: "user@lumiereskin.com", password: "Lumiere123!" }),
  });
  const loginJson = await loginRes.json() as { success?: boolean; data?: { token?: string } };
  const loginOk   = loginRes.status === 200 && loginJson?.success === true && typeof loginJson?.data?.token === "string";
  results.push({ name: "POST /api/auth/login (valid)", passed: loginOk, message: loginOk ? "Token diterima" : `Status ${loginRes.status}` });

  // Print results
  let passed = 0;
  let failed = 0;
  results.forEach((r) => {
    const icon = r.passed ? "✅" : "❌";
    console.log(`  ${icon} ${r.name.padEnd(45)} ${r.message}`);
    if (r.passed) passed++; else failed++;
  });

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`  PASS: ${passed}  |  FAIL: ${failed}  |  Total: ${results.length}`);

  if (failed === 0) {
    console.log(`\n🎉 Deployment LUMIÈRE SKIN berhasil diverifikasi!\n`);
  } else {
    console.log(`\n⚠️  Ada ${failed} verifikasi yang gagal. Periksa konfigurasi Vercel.\n`);
  }
}

main().catch(console.error);
