const staticCacheName = "static-cache-v1";
const dynamicCacheName = "dynamic-cache-v1";

const assets = [
  "./manifest.json",
  "./",
  "./index.html",
  "./css/style.css",
  "./icons/56x56.png",
  "./icons/72x72.png",
  "./icons/96x96.png",
  "./icons/112x112.png",
  "./icons/128x128.png",
  "./icons/144x144.png",
  "./icons/152x152.png",
  "./icons/196x196.png",
  "./icons/384x384.png",
  "./icons/512x512.png",
  "./icons/favicon.png",
  "./images/logo.png",
  "./images/1_paagal.jpg",
  "./images/2_o_saki_saki.jpg",
  "./images/3_aankh_marey.jpg",
  "./images/4_naach_meri_rani.jpg",
  "./js/main.js",
];

// installing service worker
self.addEventListener("install", (e) => {
  // console.log("installing app...");
  // waitUntil - wait for the task to exe, inside the ()
  e.waitUntil(
    // adding files to cache
    caches
      .open(staticCacheName)
      .then((cache) => cache.addAll(assets))
      .catch((err) => {
        return console.log("❌ SW Installation Error");
      })
  );

  // skip waiting - auto reinstall
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // console.log("updating app...");
  // delete old chache
  e.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(keys.filter((key) => key !== staticCacheName).map((key) => caches.delete(key)));
      })
      .catch((err) => {
        console.log("❌ SW Activation Error", err);
      })
  );
});

// fetch from cache storage first
// if not found then fetch from server
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches
      .match(e.request)
      .then(async (cacheRes) => {
        return (
          cacheRes ||
          fetch(e.request).then(async (fetchRes) => {
            return caches.open(dynamicCacheName).then((cache) => {
              // if req is for song - dont cache it
              if (e.request.url.indexOf(".mp3") > -1) {
                return fetchRes;
              }

              cache.put(e.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
      .catch((err) => {
        // // if user offline req for new page return offline page
        if (e.request.url.indexOf(".mp3") > -1) {
          return "";
        }
        console.log(err);
        return console.log("❌ SW Fetching Error");
      })
  );
});
