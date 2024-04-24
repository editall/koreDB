import {todoDB, User} from "./db";

const insertUser = async (name:string, email:string)=> await todoDB.insert(User, new User().from({name, email}));
const qDeleteUser = todoDB.delete(User, (query, u)=>{
    query.E(u, "name", 0, "name")
});
const deleteUser = async (name:string)=> (await qDeleteUser).query({name});
const qUpdateUser = todoDB.update(User, (query, u)=>{
    query.setFieldParam( "name", 1, "name")
        .setFieldParam( "email", 2, "email")
        .E(u, "$rowid", 0, "rowid")
});
const updateUser = async (user:User)=>{
    if(!user.$rowid) throw new Error("user.$rowid is required");
    const q = (await qUpdateUser), {$rowid:rowid, name, email} = user;
    if(name && email) q.query({rowid}, {name}, {email});
    else if(name) q.query({rowid}, {name});
    else if(email) q.query({rowid}, {email});
}
const qSelectUser = todoDB.select(User, (query, u)=>{
    query.E(u, "$rowid", 0, "rowid")
});
const selectUser = async (rowid:number)=> (await qSelectUser).query({rowid});

export {insertUser, deleteUser, updateUser, selectUser};