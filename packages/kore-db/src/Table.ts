import {exit} from "./exit.ts";

// eslint-disable-next-line @typescript-eslint/ban-types
type FieldOnlyWithKey<T> = Pick<T, {[k in keyof T]:T[k] extends Function ? never :  k}[keyof T]>;

type FieldOnly<T> = Pick<T, {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T]: T[K] extends Function ? never :
        K extends string ? (K extends `$${string}` | `_${string}` ? never : K) : never
}[keyof T]>;
/**
 * @description define Table. Super type generic parameter is self type.
 * A property that starts with $ or _ is designated as the keyPath in the table, and only one property should be designated as such.
 * If it starts with $, it implies autoIncrement, while _ simply signifies a keyPath.
 * @sample
 * ```typescript
 * class Member extends Table<Member>{
 *    $rowid:number; // keyPath & autoIncrement
 *    name:string;
 * }
 * const member:Member = new Member().fromObject({$rowid:1, name:"John"});
  * console.log(member.$rowid, member.name); // 1, John
 * ```
 */
abstract class Table<TABLE extends Table<TABLE>>{
    static readonly #scaned = new Map();
    static #initScan<T extends Table<T>>(type:new ()=>T){
        if(this.#scaned.has(type)) return;
        const table = new type();
        let keyPath = "";
        Reflect.ownKeys(table).forEach(k=>{
            if(typeof k === "string" && "$_".indexOf(k[0]) != -1){
                if(keyPath) exit(`#keyPath already defined:${String(keyPath)}`);
                this.#scaned.set(type, [keyPath = k, k[0] === "$"]);
            }
        });
        if(!keyPath) exit(`no keyPath defined`);
    }
    /**
     * @description This method scans the table and returns the keyPath.
     * @param type The table class to scan.
     * @returns The keyPath of the table.
     * @sample
     * ```typescript
     * class Member extends Table<Member>{
     *    $rowid:number;
     *    name:string;
     * }
     * const keyPath = Table.keyPath(Member);
     * console.log(keyPath); // $rowid
     * ```
     */
    static keyPath<T extends Table<T>>(type:new ()=>T):string{
        this.#initScan(type);
        return this.#scaned.get(type)[0];
    }
    /**
     * @description This method scans the table and checks if the keyPath is autoIncrement.
     * @param type The table class to scan.
     * @returns True if the keyPath is autoIncrement, false otherwise.
     * @sample
     * ```typescript
     * class Member extends Table<Member>{
     *    $rowid:number;
     *    name:string;
     * }
     * const isAutoIncrement = Table.autoIncrement(Member);
     * console.log(isAutoIncrement); // true
     * ```
     */
    static autoIncrement<T extends Table<T>>(type:new ()=>T):boolean{
        this.#initScan(type);
        return this.#scaned.get(type)[1];
    }
    /**
     * @description copy object to this instance.
     * @param obj An object where all keys, excluding the keyPath, exactly match the properties of the class.
     * @returns this instance.
     * @sample
     * ```typescript
     * class Member extends Table<Member>{
     *   $rowid:number;
     *   name:string;
     * }
     * const member:Member = new Member().from({name:"John"}); // exclude keyPath
     * ```
     */
    from(obj:FieldOnly<TABLE>):this{
        return Object.assign(this, obj);
    }
    /**
     * @description copy object to this instance.
     * @param obj An object where all keys, including the keyPath, exactly match the properties of the class.
     * @returns this instance.
     * @sample
     * ```typescript
     * class Member extends Table<Member>{
     *   $rowid:number;
     *   name:string;
     * }
     * const member:Member = new Member().fromWithKeyPath({$rowid:1, name:"John"}); // include keyPath
     * ```
     */
    fromWithKeyPath(obj:FieldOnlyWithKey<TABLE>):this{
        return Object.assign(this, obj);
    }
}

export { Table };