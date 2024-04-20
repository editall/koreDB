import {exit} from "./exit.ts";

/**
 * @description define Table. Super type generic parameter is self type.
 * @sample
 * ```typescript
 * class Member extends Table<Member>{
 *    $rowid:number;
 *    name:string;
 * }
 * const member:Member = new Member().fromObject({$rowid:1, name:"John"});
  * console.log(member.$rowid, member.name); // 1, John
 * ```
 */
abstract class Table<TABLE extends Table<TABLE>>{
    static #scaned = new Map();
    static #initScan<T extends Table<T>>(type:new ()=>T){
        if(!this.#scaned.has(type)){
            const table = new type();
            let keyPath = "";
            Reflect.ownKeys(table).forEach(k=>{
                if(typeof k === "string" && "$_".indexOf(k[0]) != -1){
                    if(keyPath) exit(`#keyPath already defined:${String(keyPath)}`);
                    this.#scaned.set(type, [keyPath = k, k[0] === "$"]);
                }
            });
            if(keyPath) exit(`no keyPath defined`);
        }
    }
    static keyPath<T extends Table<T>>(type:new ()=>T):string{
        this.#initScan(type);
        return this.#scaned.get(type)[0];
    }
    static autoIncrement<T extends Table<T>>(type:new ()=>T):boolean{
        this.#initScan(type);
        return this.#scaned.get(type)[1];
    }
    fromObject(obj:{[k in keyof TABLE]:TABLE[k]}):this{
        return Object.assign(this, obj);
    }
}
class TableWrapper<TABLE extends Table<TABLE>>{
    readonly #table:new ()=>TABLE;
    readonly #store:IDBObjectStore;
    constructor(table:new ()=>TABLE, store:IDBObjectStore){
        this.#table = table;
        this.#store = store;
    }
    index(key:keyof TABLE, unique:boolean = false):this{
        if("$_".indexOf(String(key)[0]) !== -1 || key === Table.keyPath(this.#table)) exit(`keyPath can't be indexed`);
        this.#store.createIndex(String(key), String(key), {unique});
        return this;
    }
}

export { Table, TableWrapper };