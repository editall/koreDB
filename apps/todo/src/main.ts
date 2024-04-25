import {deleteUser, insertUser} from "./dto/dtoUser.ts";
import {el} from "./el.ts";
import {setUsers} from "./comp/setUsers.ts";
import {setCategories} from "./comp/setCategories.ts";
import {setTodo} from "./comp/setTodo.ts";
import {insertCategory} from "./dto/dtoCategory.ts";
import {insertTodo} from "./dto/dtoTodo.ts";
import {getModel, initModel, setModel} from "./model.ts";

const init = async ()=>{
    el.userList.onchange = async ()=>{
        await setModel(parseInt(el.userList.value), 0);
        await setUsers();
    };
    el.removeUser.onclick = async ()=>{
        const id = getModel().user;
        if(id){
            await deleteUser(id);
            await setModel(0, 0);
            await setUsers();
        }
    };
    el.userName.onkeydown = el.userEmail.onkeydown = el.addUser.onclick = async(e:Event)=>{
        if(e instanceof KeyboardEvent && e.key !== "Enter") return;
        const name = el.userName.value, email = el.userEmail.value;
        if(name && email){
            el.userName.value = el.userEmail.value = "";
            await insertUser(name, email);
            await setUsers();
        }
    };
    el.categoryName.onkeydown = el.addCategory.onclick = async(e:Event)=>{
        if(e instanceof KeyboardEvent && e.key !== "Enter") return;
        if(!getModel().user) throw new Error("Select a user first");
        if(el.categoryName.value) insertCategory(el.categoryName.value).then(()=>{
            el.categoryName.value = "";
            setCategories();
        });
    };
    el.todoTitle.onkeydown = el.addTodo.onclick = async(e:Event)=>{
        if(e instanceof KeyboardEvent && e.key !== "Enter") return;
        const {user, category} = getModel();
        if(user && category && el.todoTitle.value){
            await insertTodo(el.todoTitle.value)
            await setTodo();
        }
    };
    await initModel();
    await setUsers();
};
await init();