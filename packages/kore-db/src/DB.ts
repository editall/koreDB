import {exit} from "./exit";
import {Join} from "./Join.ts";
import {Query, QueryMode} from "./Query.ts";
import {r2p} from "./r2p";
import {Table} from "./Table";

class TableWrapper<TABLE extends Table<TABLE>>{
    readonly #table:new ()=>TABLE;
    readonly #store:IDBObjectStore;
    constructor(table:new ()=>TABLE, store:IDBObjectStore){
        this.#table = table;
        this.#store = store;
    }
    /**
     * @description Creates an index.
     * @param {keyof TABLE} key key from the current instance, excluding the keyPath.
     * @param {boolean} [unique=false] Specifies whether the index should be unique.
     * @return {this}
     */
    index(key:keyof TABLE, unique:boolean = false):this{
        if("$_".indexOf(String(key)[0]) !== -1 || key === Table.keyPath(this.#table)) exit(`keyPath can't be indexed`);
        this.#store.createIndex(String(key), String(key), {unique});
        return this;
    }
}

/**
 * @description arrow function for create Table.
 * @param {Table} tableClass Table class inherited from {@link Table}.
 * @returns {TableWrapper} TableWrapper that owns an "index" method for creating an index.
 */
type CreateTable = <TABLE extends Table<TABLE>>(tableClass:new ()=>TABLE)=>TableWrapper<TABLE>;
type QueryBlock = (query:Query<any>, from:Join<any>)=>void;

abstract class DB{
    readonly #openAwait:Promise<void>;
    #isFirst:boolean = false;
    #db:IDBDatabase|undefined;
    protected constructor(name:string, version:number = 1){
        this.#openAwait = new Promise((resolve, reject)=>{
            const request = indexedDB.open(name, version);
            request.onerror = (e)=>{
                this.onError(e);
                reject(e);
            };
            request.onupgradeneeded = ()=>{
                this.#isFirst = true;
                this.#db = request.result;
                this.onCreate(<TABLE extends Table<TABLE>>(tableClass:new ()=>TABLE):TableWrapper<TABLE>=>{
                    if(!this.#isFirst) exit("table() must be called on onCreate()");
                    return new TableWrapper(tableClass, this.#db!.createObjectStore(tableClass.name, {
                        keyPath:Table.keyPath(tableClass), autoIncrement:Table.autoIncrement(tableClass),
                    }));
                });
            };
            request.onsuccess = ()=>{
                this.#db = request.result;
                if(this.#isFirst) this.onInit().then(resolve); else resolve();
            };
        });
    }
    /**
     * @description This method is called when the database is being created for the first time.
     * @param {CreateTable} table - A function that takes a class that extends Table and returns a TableWrapper instance.
     */
    abstract onCreate(table:CreateTable):void;
    /**
     * @description This method is called after the database has been created and is ready for use.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    abstract onInit():Promise<void>;
    /**
     * @description This method is called when an error occurs in the database.
     * @param {Event} e - The error event.
     */
    abstract onError(e:Event):void;
    /**
     * @description Starts a new transaction that includes all stores in the database for readwrite operations.
     * @returns {IDBTransaction} A new transaction.
     */
    transaction():IDBTransaction{
        return this.#db!.transaction(Array.from(this.#db!.objectStoreNames), "readwrite");
    }
    /**
     * @description Counts the number of records in the store.
     * @param {IDBObjectStore} store - The object store to count.
     * @returns {Promise<number>} A promise that resolves with the count of records.
     */
    async count(store:IDBObjectStore):Promise<number>{
        return r2p(store.count()) as Promise<number>;
    }
    /**
     * @description Inserts new records into the table.
     * @param {new ()=>TABLE} table - The table class to insert records into.
     * @param {...TABLE[]} data - The records to insert.
     * @returns {Promise<void>} A promise that resolves when the transaction is complete.
     */
    async insert<TABLE extends Table<TABLE>>(table:new ()=>TABLE, ...data:TABLE[]):Promise<void>{
        this.#isFirst || await this.#openAwait;
        const tx:IDBTransaction = this.#db!.transaction(table.name, "readwrite");
        const store:IDBObjectStore = tx.objectStore(table.name);
        const isAutoIncrement = Table.autoIncrement(table);
        const keyPath = Table.keyPath(table);
        data.forEach(d=>{
            if(isAutoIncrement) d[keyPath] = undefined;
            store.add(d)
        });
        return r2p(tx) as Promise<void>;
    }
    async #query<FROM extends Table<FROM>>(mode:QueryMode, from:new ()=>FROM, block:QueryBlock):Promise<Query<FROM>>{
        this.#isFirst || await this.#openAwait;
        return new Query(mode, from, this, block);
    }
    /**
     * @description Executes a SELECT query on the database.
     * @param {new ()=>FROM} from - The table class to select from.
     * @param {QueryBlock} block - The query block to execute.
     * @returns {Promise<Query<FROM>>} A promise that resolves with the query result.
     */
    async select<FROM extends Table<FROM>>(from:new ()=>FROM, block:QueryBlock):Promise<Query<FROM>>{
        return this.#query(QueryMode.SELECT, from, block);
    }
    /**
     * @description Executes an UPDATE query on the database.
     * @param {new ()=>FROM} from - The table class to update.
     * @param {QueryBlock} block - The query block to execute.
     * @returns {Promise<Query<FROM>>} A promise that resolves with the query result.
     */
    async update<FROM extends Table<FROM>>(from:new ()=>FROM, block:QueryBlock):Promise<Query<FROM>>{
        return this.#query(QueryMode.UPDATE, from, block);
    }
    /**
     * @description Executes a DELETE query on the database.
     * @param {new ()=>FROM} from - The table class to delete from.
     * @param {QueryBlock} block - The query block to execute.
     * @returns {Promise<Query<FROM>>} A promise that resolves with the query result.
     */
    async delete<FROM extends Table<FROM>>(from:new ()=>FROM, block:QueryBlock):Promise<Query<FROM>>{
        return this.#query(QueryMode.DELETE, from, block);
    }
    /**
     * @description Executes an INSERT SELECT query on the database.
     * @param {new ()=>FROM} from - The table class to insert select from.
     * @param {QueryBlock} block - The query block to execute.
     * @returns {Promise<Query<FROM>>} A promise that resolves with the query result.
     */
    async insertSelect<FROM extends Table<FROM>>(from:new ()=>FROM, block:QueryBlock):Promise<Query<FROM>>{
        return this.#query(QueryMode.INSERT, from, block);
    }
}

export {DB};
export type {CreateTable};

