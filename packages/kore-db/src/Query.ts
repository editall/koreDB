import {DB} from "./DB.ts";
import {Join} from "./Join.ts";
import {r2p} from "./r2p.ts";
import {Table} from "./Table.ts";
import {Where} from "./Where.ts";

enum QueryMode{SELECT, UPDATE, DELETE, INSERT}
enum FieldType{VALUE, PARAM, JOIN}
type Projection = {index:number, key:string, toKey:string};

class Query<FROM extends Table<FROM>>{
    readonly #mode:QueryMode;
    readonly #db:DB;
    readonly joins:Join<any>[] = [];
    readonly #fields:Projection[] = [];
    readonly #setFields:{key:string, type:FieldType, v0:any, v1:any}[] = [];
    readonly where:Where = new Where();
    readonly #order:{key:string, isAsc:boolean}[] = [];

    constructor(mode:QueryMode, from:new ()=>FROM, db:DB, block:(query:Query<FROM>, join:Join<FROM>)=>void){
        this.#mode = mode;
        this.#db = db;
        const join = new Join(this, from, undefined, 0, undefined);
        this.joins.push(join);
        block(this, join);
    }
    project<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, toKey:string = String(key)){
        this.#fields.push({index:this.joins.indexOf(join), key:String(key), toKey});
        return this;
    }
    setFieldParam(key:keyof FROM, v0:any, v1:any){
        this.#setFields.push({key:String(key), type:FieldType.PARAM, v0, v1});
        return this;
    }
    setFieldValue(key:keyof FROM, value:any){
        this.#setFields.push({key:String(key), type:FieldType.VALUE, v0:value, v1:0});
        return this;
    }
    setFieldJoin<TABLE extends Table<TABLE>>(key:keyof FROM, join:Join<TABLE>, joinKey:keyof TABLE){
        this.#setFields.push({key:String(key), type:FieldType.JOIN, v0:this.joins.indexOf(join), v1:String(joinKey)});
        return this;
    }
    orderBy(key:string, isAsc = true){
        this.#order.push({key, isAsc});
        return this;
    }
    E<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("=", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    NE<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("!=", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    LT<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("<", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    LTE<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("<=", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    GT<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP(">", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    GTE<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP(">=", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    LIKE<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("like", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    NLIKE<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("not like", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    IN<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("in", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    NIN<TABLE extends Table<TABLE>>(join:Join<TABLE>, key:keyof TABLE, paramIndex:number, paramKey:string):this{
        this.where.addOP("not in", this.joins.indexOf(join), String(key), paramIndex, paramKey);
        return this;
    }
    get AND():this{
        this.where.connector("and");
        return this;
    }
    get OR():this{
        this.where.connector("or");
        return this;
    }
    async query(...params:object[]){
        switch(this.#mode){
        case QueryMode.SELECT:{if(!this.#fields.length) throw new Error("no projection field"); break;}
        case QueryMode.UPDATE:{if(!this.#setFields.length) throw new Error("no update field"); break;}
        case QueryMode.INSERT:{if(!this.#setFields.length) throw new Error("no update field"); break;}
        }
        const txStore = Object.create(null);
        txStore.__tx = this.#db.transaction();
        txStore.__max = 0;
        const table = this.joins[0].table.name;
        const store = txStore[table] ?? (txStore[table] = txStore.__tx.objectStore(table));
        txStore[0] = store.keyPath;
        const j = this.joins.length;
        let i = 1, rs:any;
        if(j === 1){
            rs = await r2p(store.getAll());
            if(rs.length) rs = rs.map((t:any)=>{
                const record = Object.create(null);
                record[0] = t;
                return record;
            });
        }else while(i < j){
            const curr = this.joins[i];
            const {table, joinIndex, tableKey, joinKey} = curr;
            const store = txStore[table.name] ?? (txStore[table.name] = txStore.__tx.objectStore(table.name));
            txStore[i] = store.keyPath;
            txStore.__max = i;
            const join = this.joins[joinIndex];
            const joinStore = txStore[join.table.name];
            if(!await this.#db.count(store) || !await this.#db.count(joinStore)){
                rs = [];
                break;
            }
            if(tableKey !== store.keyPath && !store.indexNames.contains(tableKey)) throw new Error(`no such table(${table.name}) index: ${tableKey}`);
            if(i === 1){
                if(joinKey !== joinStore.keyPath && !joinStore.indexNames.contains(joinKey)) throw new Error(`no such join(${join.table.name}) index: ${joinKey}`);
                rs = await new Promise((resolve)=>{
                    const joined:any = [];
                    let cA:any, cB:any;
                    const f = (ab:string, a:any, b:any)=>{
                        if(ab === "a"){
                            if(a) cA = a; else{
                                resolve(joined);
                                return;
                            }
                        }else{
                            if(b) cB = b; else{
                                resolve(joined);
                                return;
                            }
                        }
                        if(!cA || !cB) return;
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if(cA.value[tableKey] === cB.value[joinKey]){
                            const record = Object.create(null);
                            record[i] = cA.value;
                            record[joinIndex] = cB.value;
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            joined.push(record);
                            cA.continue();
                            cA = null;
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                        }else if(cA.value[tableKey] < cB.value[joinKey]){
                            cA.continue();
                            cA = null;
                        }else{
                            cB.continue();
                            cB = null;
                        }
                    };
                    (tableKey === store.keyPath ? store : store.index(tableKey)).openCursor().onsuccess =(e:any)=>f("a", e.target.result, null);
                    (joinKey === joinStore.keyPath ? joinStore : joinStore.index(joinKey)).openCursor().onsuccess =(e:any)=>f("b", null, e.target.result);
                });
            }else{
                rs = await new Promise((resolve)=>{
                    const joined:any = [];
                    rs.sort((a:any, b:any)=>{
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if(a[joinIndex][joinKey] > b[joinIndex][joinKey]) return 1;
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if(a[joinIndex][joinKey] < b[joinIndex][joinKey]) return -1;
                        return 0;
                    });
                    let cA:any, rsIndex = 0;
                    const f =(a:any)=>{
                        if(a) cA = a; else{
                            resolve(joined);
                            return;
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if(cA.value[tableKey] < rs[rsIndex][joinIndex][joinKey]){
                            cA.continue();
                            cA = null;
                            return;
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        while(rsIndex < rs.length && cA.value[tableKey] > rs[rsIndex][joinIndex][joinKey]) rsIndex++;
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        while(rsIndex < rs.length && cA.value[tableKey] === rs[rsIndex][joinIndex][joinKey]){
                            const record = Object.assign(Object.create(null), rs[rsIndex]);
                            record[i] = cA.value;
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            joined.push(record);
                            rsIndex++;
                        }
                        if(rsIndex === rs.length){
                            resolve(joined);
                            return;
                        }
                        cA.continue();
                        cA = null;
                    };
                    (tableKey === store.keyPath ? store : store.index(tableKey)).openCursor().onsuccess = (e:any)=>f(e.target.result);
                });
            }
            if(!rs.length) break;
            i++;
        }
        if(!rs.length) return rs;
        return new Promise((resolve, reject)=>{
            rs = this.where.whereProcess(txStore, rs, params);
            switch(this.#mode){
            case QueryMode.SELECT:{
                const result = rs.map((r:any)=>this.#fields.reduce((acc, {index, key, toKey})=>{
                    acc[toKey ?? key] = r[index][key];
                    return acc;
                }, Object.create(null)));
                if(this.#order.length){
                    result.sort((a:any, b:any)=>{
                        const j = this.#order.length;
                        let i = 0;
                        while(i < j){
                            const {key, isAsc} = this.#order[i++];
                            if(a[key] > b[key]) return isAsc ? 1 : -1;
                            if(a[key] < b[key]) return isAsc ? -1 : 1;
                        }
                        return 0;
                    });
                }
                txStore.__tx.oncomplete =()=>resolve(result);
                break;
            }
            case QueryMode.DELETE:{
                rs.forEach((r:any)=>r2p(txStore[this.joins[0].table.name].delete(r[0][txStore[0]])))
                txStore.__tx.oncomplete =()=>resolve;
                break;
            }
            case QueryMode.UPDATE:{
                rs.map((r:any)=>{
                    const update = this.#setFields.reduce((acc, {key, type, v0, v1})=>{
                        switch(type){
                        case FieldType.VALUE:{
                            acc[key] = v0;
                            break;
                        }
                        case FieldType.PARAM:{
                            if(params[v0]) acc[key] = (params[v0] as any)[v1];
                            break;
                        }
                        case FieldType.JOIN:{
                            acc[key] = r[v0][v1];
                            break;
                        }
                        }
                        return acc;
                    }, Object.create(null));
                    update[txStore[0]] = r[0][txStore[0]];
                    r2p(txStore[this.joins[0].table.name].put(update))
                });
                txStore.__tx.oncomplete = resolve;
                break;
            }
            case QueryMode.INSERT:{
                rs.forEach((r:any)=>r2p(txStore[this.joins[0].table.name].add(this.#setFields.reduce((acc, {key, type, v0, v1})=>{
                    switch(type){
                    case FieldType.VALUE:{
                        acc[key] = v0;
                        break;
                    }
                    case FieldType.PARAM:{
                        if(params[v0]) acc[key] = (params[v0] as any)[v1];
                        break;
                    }
                    case FieldType.JOIN:{
                        acc[key] = r[v0][v1];
                        break;
                    }
                    }
                    return acc;
                }, Object.create(null)))));
                txStore.__tx.oncomplete = resolve;
            }
            }
            txStore.__tx.onerror = reject;
            txStore.__tx.commit();
        });
    }
}

export {Query, QueryMode};