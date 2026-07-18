/* بوابة التوزيع — Service Worker (offline-first app shell) */
const VER="business-cloud-v5";
const SHELL=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 // Firestore/Auth traffic: never intercept (their SDK handles offline itself)
 if(u.hostname.includes("googleapis.com")||u.hostname.includes("google.com")||u.hostname.includes("gstatic.com")||e.request.method!=="GET")return;
 // navigations: app shell first (works fully offline)
 if(e.request.mode==="navigate"){e.respondWith(caches.match("./index.html").then(r=>r||fetch(e.request).then(res=>{const cl=res.clone();caches.open(VER).then(c=>c.put("./index.html",cl));return res})));return;}
 // static: cache-first, then network + cache
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&u.origin===location.origin){const cl=res.clone();caches.open(VER).then(c=>c.put(e.request,cl));}return res})));
});
