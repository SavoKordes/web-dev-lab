/*
 * fake-services.js — pretend servers for exercises, given to the sandbox as setup code.
 *
 * They behave like small real APIs, work offline, answer predictably, and let
 * tests simulate failures on purpose (a 404, or the network being down).
 * Each is wrapped in a function so its data cannot clash with names in the
 * learner's code; only the functions meant to be used are put on `window`.
 */

export const FAKE_USERS = `
// Pretend server functions. Each returns a Promise, like a real network request,
// and takes 100 ms to answer. Wrapped in a function so that its data does not
// clash with names in your code; only fetchUser and fetchOrders are shared.
(function () {
  const users = {
    1: { id: 1, name: 'Ada' },
    2: { id: 2, name: 'Grace' },
    3: { id: 3, name: 'Alan' },
    4: { id: 4, name: 'Margaret' },
    5: { id: 5, name: 'Tim' },
  };
  const orders = { 1: ['notebook', 'pen'], 2: ['backpack'], 3: [] };

  window.fetchUser = function fetchUser(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (users[id]) resolve(users[id]);
        else reject(new Error('User ' + id + ' not found'));
      }, 100);
    });
  };

  window.fetchOrders = function fetchOrders(userId) {
    return new Promise((resolve) => setTimeout(() => resolve(orders[userId] ?? []), 100));
  };
})();
`;

export const FAKE_API = `
// A pretend web API. It replaces the real fetch() inside this exercise, so the
// exercise works offline and the checks can simulate errors.
//   GET /api/products      → list of products
//   GET /api/products/:id  → one product, or 404
// window.apiDown = true simulates a network failure.
(function () {
  const products = [
    { id: 1, name: 'Notebook', price: 4 },
    { id: 2, name: 'Pen', price: 1.5 },
    { id: 3, name: 'Backpack', price: 35 },
  ];

  window.fetch = async function fakeFetch(url) {
    await new Promise((resolve) => setTimeout(resolve, 50)); // a little network delay
    if (window.apiDown) throw new TypeError('Failed to fetch');
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status, headers: { 'Content-Type': 'application/json' },
    });
    if (url === '/api/products') return json(products);
    const match = String(url).match(/^\\/api\\/products\\/(\\d+)$/);
    if (match) {
      const product = products.find((p) => p.id === Number(match[1]));
      return product ? json(product) : json({ error: 'Not found' }, 404);
    }
    return json({ error: 'Not found' }, 404);
  };
})();
`;

