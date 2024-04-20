import {expect, test} from "vitest";
import {Table} from "../src";
class Member0 extends Table<Member0>{
    $rowid:number;
    name:string;
}
class Member1 extends Table<Member1>{
    _rowid:number;
    name:string;
}
class Member2 extends Table<Member2>{
    rowid:number;
    name:string;
}
test('myFunction returns correct value', () => {
    // const member0 = new Member0();
    // const member1 = new Member1();
    // const member2 = new Member2();
    expect(Table.keyPath(Member0)).toBe("$rowid");
    expect(Table.keyPath(Member1)).toBe("_rowid");
    expect(() => Table.keyPath(Member2)).toThrow();
});