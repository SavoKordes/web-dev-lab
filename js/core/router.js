/*
 * router.js — decides which view to show, based on the URL hash.
 *
 * The part of the URL after "#" is the route:
 *   index.html#/            → dashboard
 *   index.html#/learn/js    → learn view with params { moduleId: 'js' }
 *
 * Why the hash? Changing it never reloads the page and needs no server
 * configuration, but it still gives us working Back/Forward buttons and
 * links you can bookmark.
 */

/**
 * Turn a pattern like '/learn/:moduleId' into a regular expression plus the
 * list of parameter names it captures.
 *   '/learn/:moduleId'  →  { regex: /^\/learn\/([^/]+)\/?$/, keys: ['moduleId'] }
 */
function compile(pattern) {
  const keys = [];
  const source = pattern.replace(/:(\w+)/g, (_match, key) => {
    keys.push(key);
    return '([^/]+)'; // one path segment: anything except "/"
  });
  return { regex: new RegExp(`^${source}/?$`), keys };
}

/**
 * Create a router.
 * @param {Array<{path: string}>} routes - Route objects. Any extra fields (view, title…)
 *   are passed back to onMatch untouched.
 * @param {(match: {route: object, params: object, path: string}) => void} onMatch -
 *   Called every time the URL changes. route is null if nothing matched.
 * @returns {{ start: () => void }}
 */
export function createRouter(routes, onMatch) {
  // Compile every pattern once, up front, instead of on every navigation.
  const compiled = routes.map((route) => ({ route, ...compile(route.path) }));

  function resolve() {
    // '#/learn/js' → '/learn/js'. An empty hash means the home page.
    const path = decodeURIComponent(location.hash.slice(1)) || '/';

    for (const { route, regex, keys } of compiled) {
      const match = path.match(regex);
      if (match) {
        // match[0] is the full string; captured groups start at match[1].
        const params = {};
        keys.forEach((key, i) => { params[key] = match[i + 1]; });
        onMatch({ route, params, path });
        return;
      }
    }

    onMatch({ route: null, params: {}, path });
  }

  return {
    start() {
      window.addEventListener('hashchange', resolve);
      resolve(); // render the current URL immediately
    },
  };
}

/** Go to a route from code, e.g. navigate('/code'). */
export function navigate(path) {
  location.hash = path;
}
