class Join {
    table:string;
    join:Join;
    tableKey:string;
    joinKey:string;
    constructor(table:string, join:Join, tableKey:string, joinKey:string) {
        this.table = table;
        this.tableKey = tableKey;
        this.join = join;
        this.joinKey = joinKey;
    }
}

export { Join };