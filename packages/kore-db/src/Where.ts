type Connector = {op:string};
type Operator = {op:string, key:string, paramIndex:number, paramKey:string, joinIndex:number};
class Where{
    where:(Connector|Operator)[] = [{op:"or"}];
    addOP(op:string, joinIndex:number, key:string, paramIndex:number, paramKey:string){
        if("and|or".indexOf(this.where[this.where.length - 1].op) === -1) throw  new Error("invalid operation");
        this.where.push({op, key, paramIndex, paramKey, joinIndex});
        return this;
    }
    connector(op:string):this{
        if("and|or".indexOf(this.where[this.where.length - 1].op) !== -1) throw new Error("invalid operation");
        this.where.push({op});
        return this;
    }
    whereProcess(tx:any, rs:any, params:any) {
        if(this.where.length === 1) return rs;
        const j = this.where.length;
        let i = 0, connector:string, result:any[] = [];
        while (i < j) {
            const item = this.where[i++];
            if("or|and".indexOf(item.op) !== -1) {connector = item.op; continue;}
            const {key, paramIndex, paramKey, joinIndex} = item as Operator;
            const v = params[paramIndex]?.[paramKey];
            let curr:any[];
            switch (item.op) {
                case "=": {curr = rs.filter((r:any)=>r[joinIndex][key] === v); break;}
                case "!=": {curr = rs.filter((r:any)=>r[joinIndex][key] !== v); break;}
                case "in": {curr = rs.filter((r:any)=>v.includes(r[joinIndex][key])); break;}
                case "not in": {curr = rs.filter((r:any)=>!v.includes(r[joinIndex][key])); break;}
                case "<": {curr = rs.filter((r:any)=>r[joinIndex][key] < v); break;}
                case "<=": {curr = rs.filter((r:any)=>r[joinIndex][key] <= v); break;}
                case ">": {curr = rs.filter((r:any)=>r[joinIndex][key] > v); break;}
                case ">=": {curr = rs.filter((r:any)=>r[joinIndex][key] >= v); break;}
                case "like": {
                    curr = rs.filter((r:any)=>{
                        const k = r[joinIndex][key];
                        if(v[0] === "%" && v[v.length - 1] === "%") return k.indexOf(v.slice(1, -1)) > -1;
                        else if(v[0] === "%") return k.endsWith(v.slice(1));
                        else if(v[v.length - 1] === "%") return k.startsWith(v.slice(0, -1));
                        return k === v;
                    });
                    break;
                }
                case "not like": {
                    curr = rs.filter((r:any)=>{
                        const k = r[joinIndex][key];
                        if(v[0] === "%" && v[v.length - 1] === "%") return k.indexOf(v.slice(1, -1)) === -1;
                        else if(v[0] === "%") return !k.endsWith(v.slice(1));
                        else if(v[v.length - 1] === "%") return !k.startsWith(v.slice(0, -1));
                        return k !== v;
                    });
                    break;
                }
            }
            const j = tx.__max + 1;
            if(connector! === "and"){
                result = result.filter(r => curr.some(c =>{
                    let i = 0;
                    while(i < j){
                        if(r[i][tx[i]] !== c[i][tx[i]]) return false;
                        i++;
                    }
                    return true;
                }));
            }else if(connector! === "or"){
                if(result.length) curr!.forEach((c:any)=>rs.some((r:any)=>{
                    let i = 0;
                    while(i < j){
                        if(r[i][tx[i]] !== c[i][tx[i]]) return true;
                        i++;
                    }
                    return false;
                }) && result.push(c));
                else result = curr!;
            }
        }
        return result;
    }

}

export { Where };