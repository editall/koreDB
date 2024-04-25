import {deleteUser, insertUser} from "./dto/dtoUser.ts";
import {el} from "./el.ts";
import {setUsers} from "./comp/setUsers.ts";
import {setCategories} from "./comp/setCategories.ts";
import {setTodo} from "./comp/setTodo.ts";
import {insertCategory} from "./dto/dtoCategory.ts";
import {insertTodo} from "./dto/dtoTodo.ts";
import {getModel, initModel, setModel} from "./model.ts";

const init = async ()=>{
    await initModel();
    await setUsers();
    el.userList.onchange = async ()=>{
        await setModel(parseInt(el.userList.value), 0);
        await setCategories();
    };
    el.removeUser.onclick = async ()=>{
        const id = getModel().user;
        if(id){
            await deleteUser(id);
            await setModel(0, undefined);
            await setUsers();
            await setCategories();
        }
    };
    el.addUser.onclick = async()=>{
        const name = el.userName.value, email = el.userEmail.value;
        if(name && email){
            el.userName.value = el.userEmail.value = "";
            await insertUser(name, email);
            await setUsers();
        }
    };
    await setCategories();
    el.addCategory.onclick = ()=>{
        if(!getModel().user) throw new Error("Select a user first");
        if(el.categoryName.value) insertCategory(el.categoryName.value).then(()=>{
            el.categoryName.value = "";
            setCategories();
        });
    };
    el.addTodo.onclick = async ()=>{
        const {user, category} = getModel();
        console.log(user, category, el.todoTitle.value);
        if(user && category && el.todoTitle.value){

            await insertTodo(el.todoTitle.value)
            await setTodo();
        }
    }
    if(getModel().category) await setTodo();
};
await init();