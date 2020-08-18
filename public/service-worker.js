const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/styles.css",
    "/assets/js/index.js",
    "/assets/icons/icon-192x192.png",
    "/assets/icons/icon-512x512.png"
    ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
//added in the above to give cache and data cache variables

//*added in a install and access to Cache API
self.addEventListener("install", (evt)=>{
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache)=>{
            cache.addAll(FILES_TO_CACHE)
            console.log("Your files were pre-cached successfully!")
        }) //! need to double check this
            .then(() => self.skipWaiting())
    );
});

//*this creates the code for the activation of the cache storage. By using keys, it will return all the subaches in the cache storage. It returns the data via an array of strings
self.addEventListener("activate", (evt)=>{
    evt.waitUntil(
        caches.keys().then((keylist) =>{
            return Promise.all(
                keylist.map((key) =>{
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                        //*only returns when the function is done with the cleanup of the old cache data
                    }
                })
            )
        })
       .then(() => self.clients.claim())
        //checks that service worker is functioning properly
    );
});

//this is for fetching the data if the request is not in the cache then it will use other origins such as url
self.addEventListener("fetch", (evt) => {
    if(evt.request.method !== "GET" ||
    !evt.request.url.startsWith(self.location.origin)
    ) {
        evt.respondWith(fetch(evt.request));
        return;
    }
    //this will GET the request from data from the api routes
    //! should it be /api/ or /api/transactions?
    if (evt.request.url.includes ("/api/transactions")){
        //created not only a network request but also a fallback when offline
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then((response) => {
                    cache.put(evt.request, response.clone());
                    return response;
                })//by having a clone on the response object, it stores all the response data, and are still returning the original response.  
                .catch(() => caches.match(evt.request));
                })
            );
                return;
    }
//using cache first for other requests for performance, if not there then make a network request to place response in cache
    evt.respondWith(
        caches.match(evt.request).then((cachedResponse)=>{
            if (cachedResponse) { return (cachedResponse)};
        //when request is not in the cache, make the network request and cache that response
                 return caches.open(DATA_CACHE_NAME).then(cache =>{
                    return fetch (evt.request).then(response => {
                      return cache.put(evt.request, response.clone()).then(() => {
                    return response;
                    });
                });
            });
        })
    );
});



