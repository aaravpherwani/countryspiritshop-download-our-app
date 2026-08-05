const CACHE_NAME = "country-spirit-launcher-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png"
];


/*
 * INSTALL
 */

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then((cache) => {

        return cache.addAll(APP_SHELL);

      })

  );

  self.skipWaiting();

});


/*
 * ACTIVATE
 */

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys()
      .then((cacheNames) => {

        return Promise.all(

          cacheNames
            .filter(
              (name) => name !== CACHE_NAME
            )
            .map(
              (name) => caches.delete(name)
            )

        );

      })

  );

  self.clients.claim();

});


/*
 * FETCH
 *
 * We only cache the launcher itself.
 * Google Sites is NOT cached.
 */

self.addEventListener("fetch", (event) => {

  const request = event.request;

  /*
   * Only handle normal GET requests.
   */

  if (request.method !== "GET") {
    return;
  }


  /*
   * Let external sites, including Google Sites,
   * go directly to the network.
   */

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }


  /*
   * For the launcher itself:
   * try the network first so updates are picked up.
   */

  event.respondWith(

    fetch(request)
      .then((response) => {

        const responseClone =
          response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {

            cache.put(
              request,
              responseClone
            );

          });

        return response;

      })

      .catch(() => {

        return caches.match(request);

      })

  );

});
