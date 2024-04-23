import {exit} from "./exit.ts";

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
// eslint-disable-next-line @typescript-eslint/ban-types
type FieldOnly<T> = Pick<T, {[k in keyof T]:T[k] extends Function ? never :  k}[keyof T]>;

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
    static keyPath<T extends Table<T>>(type:new ()=>T):string{
        this.#initScan(type);
        return this.#scaned.get(type)[0];
    }
    static autoIncrement<T extends Table<T>>(type:new ()=>T):boolean{
        this.#initScan(type);
        return this.#scaned.get(type)[1];
    }
    /**
     * @description copy object to this instance.
     * @param obj object where all keys exactly match the properties of the class.
     * @returns this instance.
     * @sample
     * ```typescript
     * class Member extends Table<Member>{
     *   $rowid:number;
     *   name:string;
     * }
     * const member:Member = new Member().from({$rowid:1, name:"John"});
     * ```
     */
    from(obj:FieldOnly<TABLE>):this{
        return Object.assign(this, obj);
    }
}
export { Table };