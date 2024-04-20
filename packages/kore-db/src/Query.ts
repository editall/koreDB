// import {Where} from "./Where.ts";
// import {Join} from "./Join.ts";
// import {DB} from "./DB.ts";
//
// enum QueryMode{SELECT, UPDATE, DELETE, INSERT}
//
// class Query{
//     #mode:QueryMode;
//     joins:Join[];
//     #db:DB;
//     where = new Where();
//     #fields = []; #order = []; #setFields = [];
//     constructor(mode:QueryMode, from, db, block){
//         this.#mode = mode;
//         this.#db = db;
//         const join = new Join(from, null, null, null);
//         this.joins = [join];
//         block(this, join);
//     }
//     join(table, tableKey, join, joinKey){
//         const j = new Join(table, join, tableKey, joinKey);
//         this.joins.push(j);
//         return j;
//     }
//     project(join, key, toKey ){
//         this.#fields.push({join, key, toKey});
//         return this;
//     }
//     setField(key, type, v0, v1){
//         this.#setFields.push({key, type, v0, v1});
//         return this;
//     }
//     orderBy(key, isAsc = true) {
//         this.#order.push({key, isAsc});
//         return this;
//     }
//     async query(params){
//         if(this.#mode === "select" && !this.#fields.length) throw new Error("no projection field");
//         if("update|insert".indexOf(this.#mode) !== -1 && !this.#setFields.length) throw new Error("no update field");
//         const txStore = Object.create(null);
//         txStore.__tx = this.#db.transaction();
//         txStore.__max = 0;
//         const table = this.joins[0].table;
//         const store = txStore[table] ?? (txStore[table] = txStore.__tx.objectStore(table));
//         txStore[0] = store.keyPath;
//         let i = 1, j = this.joins.length, rs;
//         if(j === 1){
//             rs = await r2p(store.getAll());
//             if(rs.length) rs = rs.map(t=>{
//                 const record = Object.create(null);
//                 record[0] = t;
//                 return record;
//             });
//         }else while(i < j){
//             const curr = this.joins[i];
//             const {table, join, tableKey, joinKey} = curr;
//             const store = txStore[table] ?? (txStore[table] = txStore.__tx.objectStore(table));
//             txStore[i] = store.keyPath;
//             txStore.__max = i;
//             const joinIndex = this.joins.indexOf(join), joinStore = txStore[join.table];
//             if(!this.#db.count(store) || !this.#db.count(joinStore)){
//                 rs = [];
//                 break;
//             }
//             if(tableKey !== store.keyPath && !store.indexNames.contains(tableKey)) throw new Error(`no such table(${table}) index: ${tableKey}`);
//             if(i === 1){
//                 if(joinKey !== joinStore.keyPath &&  !joinStore.indexNames.contains(joinKey)) throw new Error(`no such join(${join.table}) index: ${joinKey}`);
//                 rs = await new Promise((resolve, reject)=>{
//                     const joined = [];
//                     let cA, cB;
//                     const f = (ab, a, b)=>{
//                         if(ab === "a"){
//                             if(a) cA = a; else{
//                                 resolve(joined);
//                                 return;
//                             }
//                         }else{
//                             if(b) cB = b; else{
//                                 resolve(joined);
//                                 return;
//                             }
//                         }
//                         if(!cA || !cB) return;
//                         if(cA.value[tableKey] === cB.value[joinKey]) {
//                             const record = Object.create(null);
//                             record[i] = cA.value;
//                             record[joinIndex] = cB.value;
//                             joined.push(record);
//                             cA.continue();
//                             cA = null;
//                         }else if(cA.value[tableKey] < cB.value[joinKey]){
//                             cA.continue();
//                             cA = null;
//                         }else{
//                             cB.continue();
//                             cB = null;
//                         }
//                     };
//                     (tableKey === store.keyPath ? store : store.index(tableKey)).openCursor().onsuccess = e => f("a", e.target.result, null);
//                     (joinKey === joinStore.keyPath ? joinStore : joinStore.index(joinKey)).openCursor().onsuccess = e => f("b", null, e.target.result);
//                 });
//             }else{
//                 rs = await new Promise((resolve, reject) => {
//                     const joined = [];
//                     rs.sort((a, b) => {
//                         if(a[joinIndex][joinKey] > b[joinIndex][joinKey]) return 1;
//                         if(a[joinIndex][joinKey] < b[joinIndex][joinKey]) return -1;
//                         return 0;
//                     });
//                     let cA, rsIndex = 0;
//                     const f = a=>{
//                         if(a) cA = a; else {
//                             resolve(joined);
//                             return;
//                         }
//                         if(cA.value[tableKey] < rs[rsIndex][joinIndex][joinKey]){
//                             cA.continue();
//                             cA = null;
//                             return;
//                         }
//                         while(rsIndex < rs.length && cA.value[tableKey] > rs[rsIndex][joinIndex][joinKey]) rsIndex++;
//                         while(rsIndex < rs.length && cA.value[tableKey] === rs[rsIndex][joinIndex][joinKey]) {
//                             const record = Object.assign(Object.create(null), rs[rsIndex]);
//                             record[i] = cA.value;
//                             joined.push(record);
//                             rsIndex++;
//                         }
//                         if(rsIndex === rs.length){
//                             resolve(joined);
//                             return;
//                         }
//                         cA.continue();
//                         cA = null;
//                     };
//                     (tableKey === store.keyPath ? store : store.index(tableKey)).openCursor().onsuccess = e => f(e.target.result);
//                 });
//             }
//             if(!rs.length) break;
//             i++;
//         }
//         if(!rs.length) return rs;
//         return new Promise((resolve, reject)=>{
//             rs = this.where.whereProcess(txStore, rs, params);
//             switch(this.#mode){
//                 case "select":{
//                     const result = rs.map(r=>this.#fields.reduce((acc, {join, key, toKey})=>{
//                         const joinIndex = this.joins.indexOf(join);
//                         acc[toKey ?? key] = r[joinIndex][key];
//                         return acc;
//                     }, Object.create(null)));
//                     if(this.#order.length){
//                         result.sort((a, b)=>{
//                             let i = 0, j = this.#order.length;
//                             while(i < j){
//                                 const {key, isAsc} = this.#order[i++];
//                                 if(a[key] > b[key]) return isAsc ? 1 : -1;
//                                 if(a[key] < b[key]) return isAsc ? -1 : 1;
//                             }
//                             return 0;
//                         });
//                     }
//                     txStore.__tx.oncomplete =_=>resolve(result);
//                     break;
//                 }
//                 case "delete":{
//                     rs.forEach(r=>r2p(txStore[this.joins[0].table].delete(r[0][txStore[0]])))
//                     txStore.__tx.oncomplete =_=>resolve;
//                     break;
//                 }
//                 case "update":{
//                     rs.map(r=>{
//                         const update = this.#setFields.reduce((acc, {key, type, v0, v1})=>{
//                             switch(type){
//                                 case "v":{acc[key] = v0; break;}
//                                 case "p":{acc[key] = params[v0][v1]; break;}
//                                 case "j":{acc[key] = r[v0][v1]; break;}
//                             }
//                             return acc;
//                         }, Object.create(null));
//                         update[txStore[0]] = r[0][txStore[0]];
//                         r2p(txStore[this.joins[0].table].put(update))
//                     });
//                     txStore.__tx.oncomplete = resolve;
//                     break;
//                 }
//                 case "insert":{
//                     rs.forEach(r=>r2p(txStore[this.joins[0].table].add(
//                         this.#setFields.reduce((acc, {key, type, v0, v1})=>{
//                             switch(type){
//                                 case "v":{acc[key] = v0; break;}
//                                 case "p":{acc[key] = params[v0][v1]; break;}
//                                 case "j":{acc[key] = r[v0][v1]; break;}
//                             }
//                             return acc;
//                         }, Object.create(null))))
//                     );
//                     txStore.__tx.oncomplete = resolve;
//                 }
//             }
//             txStore.__tx.onerror = reject;
//             txStore.__tx.commit();
//         });
//     }
// }
//
// export { Query };