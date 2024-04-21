import {r2p} from "./r2p.ts";

class Where{
    where:({op:string}|{op:string, key:string, paramIndex:number, paramKey:string, joinIndex:number})[] = [{op:"or"}];
    addOP(op:string, joinIndex:number, key:string, paramIndex:number, paramKey:string){
        if("and|or".indexOf(this.where[this.where.length - 1].op) === -1) throw  new Error("invalid operation");
        this.where.push({op, key, paramIndex, paramKey, joinIndex});
        return this;
    }
    #query(query, store, indexes, key) {
        return r2p(indexes.contains(key) ? store.index(key).getAll(query) : store.getAll(query));
    }
    whereProcess(tx, rs, params) {
        if(this.where.length === 1) return rs;
        let i = 0, j = this.where.length, connector, result = [];
        while (i < j) {
            const {op, key, paramIndex, paramKey, joinIndex} = this.where[i++];
            const v = params[paramIndex]?.[paramKey];
            let curr;
            switch (op) {
                case "or":case "and": {connector = op; break;}
                case "=": {curr = rs.filter(r=>r[joinIndex][key] === v); break;}
                case "!=": {curr = rs.filter(r=>r[joinIndex][key] !== v); break;}
                case "in": {curr = rs.filter(r=>v.includes(r[joinIndex][key])); break;}
                case "not in": {curr = rs.filter(r=>!v.includes(r[joinIndex][key])); break;}
                case "<": {curr = rs.filter(r=>r[joinIndex][key] < v); break;}
                case "<=": {curr = rs.filter(r=>r[joinIndex][key] <= v); break;}
                case ">": {curr = rs.filter(r=>r[joinIndex][key] > v); break;}
                case ">=": {curr = rs.filter(r=>r[joinIndex][key] >= v); break;}
                case "like": {
                    curr = rs.filter(r=>{
                        const k = r[joinIndex][key];
                        if(v[0] === "%" && v[v.length - 1] === "%") return k.indexOf(v.slice(1, -1)) > -1;
                        else if(v[0] === "%") return k.endsWith(v.slice(1));
                        else if(v[v.length - 1] === "%") return k.startsWith(v.slice(0, -1));
                        return k === v;
                    });
                    break;
                }
                case "not like": {
                    curr = rs.filter(r=>{
                        const k = r[joinIndex][key];
                        if(v[0] === "%" && v[v.length - 1] === "%") return k.indexOf(v.slice(1, -1)) === -1;
                        else if(v[0] === "%") return !k.endsWith(v.slice(1));
                        else if(v[v.length - 1] === "%") return !k.startsWith(v.slice(0, -1));
                        return k !== v;
                    });
                    break;
                }
            }
            if(op !== "or" && op !== "and"){
                const j = tx.__max + 1;
                if(connector === "and"){
                    result = result.filter(r => curr.some(c =>{
                        let i = 0;
                        while(i < j){
                            if(r[i][tx[i]] !== c[i][tx[i]]) return false;
                            i++;
                        }
                        return true;
                    }));
                }else if(connector === "or"){
                    if(result.length) curr.forEach(c =>rs.some(r=>{
                        let i = 0;
                        while(i < j){
                            if(r[i][tx[i]] !== c[i][tx[i]]) return true;
                            i++;
                        }
                        return false;
                    }) && result.push(c));
                    else result = curr;
                }
            }
        }
        return result;
    }

}

export { Where };