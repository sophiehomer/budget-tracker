const APP_PREFIX = 'budget_tracker';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./js/index.js",
    "./js/idb.js",
    "./css/styles.css"
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        }).catch(error => console.log(error))
    );

    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keyList => {
            let cacheKeeplist = keyList.filter(key => {
                return key.indexOf(APP_PREFIX);
            });

            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map((key, i) => {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            )
        })
    )
});

self.addEventListener('fetch', (e) => {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(request => {
            if(request) {
                console.log('resonding with cache : ' + e.request.url)
                return request;
            } else {
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
});