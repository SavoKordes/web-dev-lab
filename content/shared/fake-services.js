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


export const FAKE_WEATHER = `
// A pretend Open-Meteo. It answers the same URLs with the same response format
// as the real API (geocoding-api.open-meteo.com and api.open-meteo.com), so your
// code works unchanged against the real service. window.apiDown = true
// simulates a network failure.
(function () {
  const places = {
    berlin: { name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.41 },
    lisbon: { name: 'Lisbon', country: 'Portugal', latitude: 38.72, longitude: -9.14 },
    'são paulo': { name: 'São Paulo', country: 'Brazil', latitude: -23.55, longitude: -46.63 },
  };
  const forecasts = [
    { latitude: 52.52, longitude: 13.41, current: { temperature_2m: 12.4, wind_speed_10m: 18.2, weather_code: 2 },
      daily: { time: ['2026-03-02', '2026-03-03', '2026-03-04'], weather_code: [2, 61, 73], temperature_2m_max: [14.1, 10.6, 8.7], temperature_2m_min: [5.6, 3.9, 1.6] } },
    { latitude: 38.72, longitude: -9.14, current: { temperature_2m: 18.6, wind_speed_10m: 11.0, weather_code: 0 },
      daily: { time: ['2026-03-02', '2026-03-03', '2026-03-04'], weather_code: [0, 1, 80], temperature_2m_max: [20.2, 19.1, 17.5], temperature_2m_min: [11.8, 12.4, 12.0] } },
    { latitude: -23.55, longitude: -46.63, current: { temperature_2m: 27.1, wind_speed_10m: 9.4, weather_code: 95 },
      daily: { time: ['2026-03-02', '2026-03-03', '2026-03-04'], weather_code: [95, 63, 3], temperature_2m_max: [30.2, 28.4, 29.0], temperature_2m_min: [21.0, 20.6, 20.9] } },
  ];

  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  window.fetch = async function fakeOpenMeteo(input) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (window.apiDown) throw new TypeError('Failed to fetch');
    const raw = String(input);
    // Like a strict server: a URL with unencoded spaces or special characters is rejected.
    if (/[\\s\\u0080-\\uffff]/.test(raw)) return json({ error: true, reason: 'Encode parameters with encodeURIComponent' }, 400);
    const url = new URL(raw);
    if (url.hostname === 'geocoding-api.open-meteo.com' && url.pathname === '/v1/search') {
      const place = places[(url.searchParams.get('name') ?? '').trim().toLowerCase()];
      return json(place ? { results: [place] } : { generationtime_ms: 0.4 });
    }
    if (url.hostname === 'api.open-meteo.com' && url.pathname === '/v1/forecast') {
      const lat = Number(url.searchParams.get('latitude'));
      const lon = Number(url.searchParams.get('longitude'));
      const match = forecasts.find((f) => Math.abs(f.latitude - lat) < 0.01 && Math.abs(f.longitude - lon) < 0.01);
      return match ? json({ current: match.current, daily: match.daily }) : json({ error: true, reason: 'Latitude must be in range of -90 to 90°' }, 400);
    }
    return json({ error: true, reason: 'Not found' }, 404);
  };
})();
`;

export const ORDERS_DATA = `
// The business's orders. Refunded orders do not count as revenue.
const ORDERS = [
  { id: 1, date: '2026-01-05', customer: 'Ada', product: 'Coffee beans', total: 120, status: 'shipped' },
  { id: 2, date: '2026-01-12', customer: 'Grace', product: 'Teapot', total: 290, status: 'shipped' },
  { id: 3, date: '2026-01-20', customer: 'Alan', product: 'Mugs', total: 75, status: 'refunded' },
  { id: 4, date: '2026-02-02', customer: 'Margaret', product: 'Coffee beans', total: 96.5, status: 'shipped' },
  { id: 5, date: '2026-02-10', customer: 'Tim', product: 'Grinder', total: 310, status: 'paid' },
  { id: 6, date: '2026-02-14', customer: 'Ada', product: 'Coffee beans', total: 48, status: 'paid' },
  { id: 7, date: '2026-02-21', customer: 'Linus', product: 'Mugs', total: 150, status: 'refunded' },
  { id: 8, date: '2026-03-01', customer: 'Grace', product: 'Coffee beans', total: 64, status: 'paid' },
  { id: 9, date: '2026-03-07', customer: 'Alan', product: 'Teapot', total: 85, status: 'shipped' },
  { id: 10, date: '2026-03-15', customer: 'Katherine', product: 'Gift card', total: 50, status: 'paid' },
  { id: 11, date: '2026-03-22', customer: 'Tim', product: 'Coffee beans', total: 101, status: 'shipped' },
  { id: 12, date: '2026-03-28', customer: 'Hedy', product: 'Mugs', total: 70, status: 'paid' },
];
`;
