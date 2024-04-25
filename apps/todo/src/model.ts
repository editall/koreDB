import {Model, todoDB} from "./db.ts";

let model:Model;

const getModel = ()=> model;
const initModel = async()=>{
    const query = await todoDB.select(Model, (query, m)=>{
        query.project(m, "user")
            .project(m, "category")
            .E(m, "$rowid", 0, "rowid")
    });
    const v = await query.query({rowid:1});
    model = new Model().from(v[0]);
};
const qSet = todoDB.update(Model, (query, m)=>{
    query.setFieldParam( "user", 0, "user")
        .setFieldParam( "category", 0, "category")
        .E(m, "$rowid", 0, "$rowid")
});
const setModel = async (user:number|undefined, category:number|undefined)=>{
    if(user) model.user = user;
    if(category) model.category = category;
    if(user || category) await (await qSet).query(model);
}
export {getModel, initModel, setModel};