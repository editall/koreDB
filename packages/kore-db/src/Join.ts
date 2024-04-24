import {Query} from "./Query.ts";
import {Table} from "./Table.ts";

class Join<TABLE extends Table<TABLE>>{
    readonly #query:Query<any>;
    table:new ()=>TABLE;
    tableKey:string|undefined;
    joinIndex:number;
    joinKey:string|undefined;
    constructor(query:Query<any>, table:new ()=>TABLE, tableKey:keyof TABLE|undefined, joinIndex:number, joinKey:string|undefined){
        this.#query = query;
        this.table = table;
        this.tableKey = String(tableKey);
        this.joinIndex = joinIndex;
        this.joinKey = joinKey;
    }
    join<JOIN extends Table<JOIN>>(table:new ()=>JOIN, tableKey:keyof JOIN, joinKey:keyof TABLE):Join<JOIN>{
        const j = new Join(this.#query, table, tableKey, this.#query.joins.indexOf(this), String(joinKey));
        this.#query.joins.push(j);
        return j;
    }
}

export {Join};