const r2p = (r:IDBRequest)=>new Promise((resolve, reject)=>{
    r.onsuccess = ()=>resolve(r.result);
    r.onerror = reject;
});

export {r2p};