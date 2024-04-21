import {Query} from "./Query.ts";
import {Table} from "./Table.ts";

class Join<TABLE extends Table<TABLE>> {
    query:Query<any>;
    table:new ()=>TABLE;
    joinIndex:number;
    tableKey:keyof TABLE | undefined;
    joinKey:string | undefined;
    constructor(query:Query<any>, table:new ()=>TABLE, tableKey:keyof TABLE | undefined, joinIndex:number, joinKey:string|undefined){
        this.query = query;
        this.table = table;
        // 여기 if문이 없어도 되긴 하겠네요
        if(tableKey) this.tableKey = tableKey;
        this.joinIndex = joinIndex;
        if(joinKey) this.joinKey = joinKey;
    }
    join<JOIN extends Table<JOIN>>(
        table:new ()=>JOIN, tableKey:keyof JOIN, joinKey:keyof TABLE
    ):Join<JOIN>{
        const j = new Join(this.query, table, tableKey,this.joinIndex, String(joinKey));
        this.query.joins.push(j);
        return j;
    }


}

export { Join };