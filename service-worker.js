//!need some help with this section: 

const { response } = require("express");

//*I think I need to add all the file in a const FILES_TO_CACHE =[array]
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
//added in the above to give cache and data cache variables

//*added in a install and access to Cache API
self.addEventListener("install", (evt)=>{
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache)=>{
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        }) //! need to double check this
    )
    self.skipWaiting();
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
    )
    self.clients.claim(); //checks that service worker is functioning properly
});

//*this is for fetching the data
self.addEventListener("fetch", (evt) => {
    if (evt.request.url.includes ("/api/")){
        evt.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then((cache) =>{
                .then((response) =>{
                    if (response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }//by having a clone on the response object, it stores all the response data, and are still returning the original response.  
                    return response;
                })
                .catch((err)=>{console.log(err)}
                );
                return;
            })
        )
    }
//this is for offline 
    evt.respondWith(
        caches.match(evt.request).then((response)=>{
        return response || fetch(evt.request);
        })
    );
});



