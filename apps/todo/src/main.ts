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
    el.userList.onchange = ()=>{
        setModel(parseInt(el.userList.value), 0);
    };
    el.removeUser.onclick = async ()=>{
        const id = getModel().user;
        if(id){
            await deleteUser(id);
            await setModel(0, undefined);
            setUsers();
        }
    };
    el.addUser.onclick = ()=>{
        const name = el.userName.value, email = el.userEmail.value;
        if(name && email){
            el.userName.value = el.userEmail.value = "";
            insertUser(name, email).then(()=>{
                setUsers();
            });
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
    el.addTodo.onclick = ()=>{
        const {user, category} = getModel();
        if(user && category && el.todo.value) insertTodo(el.todo.value).then(()=>{
            setTodo();
        });
    }
    if(getModel().category) setTodo();
};
await init();