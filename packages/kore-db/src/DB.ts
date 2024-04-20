import { exit } from "./exit";
import { r2p } from "./r2p";
import { Table, TableWrapper } from "./Table";
// import {Query} from "./Query.ts";

abstract class DB {
  #isFirst: boolean = false;
  // @ts-ignore
  #openAwait: Promise<void>;
  #db: IDBDatabase | undefined;
  protected constructor(dbName: string, version: number = 1) {
    this.#openAwait = new Promise((resolve, reject) => {
      console.log("open", window.indexedDB);
      const request = indexedDB.open(dbName, version);
      request.onerror = (e) => {
        console.log("error", e);
        this.onError(e);
        reject(e);
      };
      request.onupgradeneeded = () => {
        console.log("onupgrade");
        this.#isFirst = true;
        this.#db = request.result;
        this.onCreate(
          <TABLE extends Table<TABLE>>(
            tableClass: new () => TABLE
          ): TableWrapper<TABLE> => {
            if (!this.#isFirst) exit("table() must be called on onCreate()");
            console.log(
              "createObjectStore",
              tableClass.name,
              Table.keyPath(tableClass),
              Table.autoIncrement(tableClass)
            );
            return new TableWrapper(
              tableClass,
              this.#db!.createObjectStore(tableClass.name, {
                keyPath: Table.keyPath(tableClass),
                autoIncrement: Table.autoIncrement(tableClass),
              })
            );
          }
        );
      };
      request.onsuccess = () => {
        this.#db = request.result;
        if (this.#isFirst) this.onInit().then(resolve);
        else resolve();
      };
    });
  }
  abstract onCreate(
    f: <TABLE extends Table<TABLE>>(
      tableClass: new () => TABLE
    ) => TableWrapper<TABLE>
  ): void;
  abstract onInit(): Promise<void>;
  abstract onError(e: Event): void;

  transaction(): IDBTransaction {
    return this.#db!.transaction(
      Array.from(this.#db!.objectStoreNames),
      "readwrite"
    );
  }
  async count(store: IDBObjectStore) {
    return await r2p(store.count());
  }
  // async select(from, block) {
  //     this.#isFirst || await this.#openAwait;
  //     return new Query("select", from, this, block);
  // }
  // async update(from, block) {
  //     this.#isFirst || await this.#openAwait;
  //     return new Query("update", from, this, block);
  // }
  // async delete(from, block) {
  //     this.#isFirst || await this.#openAwait;
  //     return new Query("delete", from, this, block);
  // }
  // async insert(from, block) {
  //     this.#isFirst || await this.#openAwait;
  //     return new Query("insert", from, this, block);
  // }
  // async bulkInsert(table, dataArr) {
  //     const tx = this.#db.transaction(table, "readwrite"), store = tx.objectStore(table);
  //     dataArr.forEach(d =>store.add(d));
  //     return r2p(tx);
  // }
}

export { DB };
