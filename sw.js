const V='fractio-v12';
const A=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(A.map(u=>fetch(u,{cache:'reload'}).then(r=>{if(r.ok)return c.put(u,r);}))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const page=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
  if(page){
    // pages : réseau d'abord (toujours la dernière version), cache en secours hors ligne
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put('./index.html',c));return res;})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(x=>x||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(y=>y.put(r,c));return res;})));
});
