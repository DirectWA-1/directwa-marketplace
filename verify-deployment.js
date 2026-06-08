// verify-deployment.js
const BASE_URL = 'https://directwa.co.za';

async function checkPage(path, description, expectedText = '') {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();

  try {
    const res = await fetch(url);
    const text = await res.text();
    const duration = Date.now() - start;

    const statusOk = res.status === 200;
    const textOk = expectedText ? text.includes(expectedText) : true;

    if (statusOk && textOk) {
      console.log(`✅ ${description.padEnd(28)} | ${res.status} | ${duration}ms`);
    } else if (statusOk) {
      console.log(`⚠️  ${description.padEnd(28)} | ${res.status} | ${duration}ms (text not found)`);
    } else {
      console.log(`❌ ${description.padEnd(28)} | ${res.status} | ${duration}ms`);
    }
  } catch (error) {
    console.log(`❌ ${description.padEnd(28)} | ERROR: ${error.message}`);
  }
}

async function runChecks() {
  console.log(`\n🔍 Verifying deployment: ${BASE_URL}\n`);
  console.log('Page'.padEnd(30) + '| Status | Time');
  console.log('-'.repeat(52));

  await checkPage('/', 'Homepage', 'DirectWA');
  await checkPage('/listings', 'Browse Listings', 'Browse Listings');
  await checkPage('/sell', 'Sell Page');                    // No text check
  await checkPage('/wishlist', 'Wishlist Page');
  await checkPage('/cart', 'Cart Page');
  await checkPage('/seller/dashboard', 'Seller Dashboard');

  console.log('\n✅ Verification complete.\n');
}

runChecks();