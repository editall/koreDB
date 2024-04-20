class Table{
    #store:IDBObjectStore;
    constructor(store:IDBObjectStore){this.#store = store;}
    index(keyPath:string, unique:boolean = false){
        this.#store.createIndex(keyPath, keyPath, {unique});
        return this;
    }
}
export { Table };