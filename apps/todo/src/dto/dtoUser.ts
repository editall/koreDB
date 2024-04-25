import {todoDB, User} from "../db.ts";

const insertUser = async (name:string, email:string)=> todoDB.insert(User, new User().from({name, email}));
const qDeleteUser = todoDB.delete(User, (query, u)=>{
    query.E(u, "$rowid", 0, "id")
});
const deleteUser = async (id:number)=> (await qDeleteUser).query({id});
const qUpdateUser = todoDB.update(User, (query, u)=>{
    query.setFieldParam( "name", 1, "name")
        .setFieldParam( "email", 2, "email")
        .E(u, "$rowid", 0, "rowid")
});
const updateUser = async (user:User)=>{
    if(!user.$rowid) throw new Error("user.$rowid is required");
    const q = (await qUpdateUser), {$rowid:rowid, name, email} = user;
    if(name && email) return q.query({rowid}, {name}, {email});
    else if(name) return q.query({rowid}, {name});
    else if(email) return q.query({rowid}, null, {email});
}
const qUserList = todoDB.select(User, (query, u)=>{
    query.project(u, "$rowid", "id")
        .project(u, "name")
        .project(u, "email")
        .orderBy("name")
});
const userList = async ()=> (await qUserList).query();

export {insertUser, deleteUser, updateUser, userList};