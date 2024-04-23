const r2p = (r:IDBRequest|IDBTransaction)=>new Promise((resolve, reject)=>{
    r.onerror = reject;
    if(r instanceof IDBTransaction) r.oncomplete = ()=>resolve(r);
    else if(r instanceof IDBRequest) r.onsuccess = ()=>resolve(r.result);
});

export {r2p};