import {deleteUser, insertUser} from "./dto/dtoUser.ts";
import {el} from "./el.ts";
import {model} from "./model.ts";
import {setUsers} from "./comp/setUsers.ts";
import {setCategories} from "./comp/setCategories.ts";
import {setTodo} from "./comp/setTodo.ts";
import {insertCategory} from "./dto/dtoCategory.ts";
import {insertTodo} from "./dto/dtoTodo.ts";

const init = ()=>{
    el.userList.onchange = ()=>{
        model.currentUser = parseInt(el.userList.value);
    };
    el.removeUser.onclick = ()=>{
        if(model.currentUser) deleteUser(model.currentUser).then(()=>{
            model.currentUser = 0;
            setUsers();
        });
    };
    el.addUser.onclick = ()=>{
        if(el.userName.value && el.userEmail.value) insertUser(el.userName.value, el.userEmail.value).then(()=>{
            el.userName.value = "";
            el.userEmail.value = "";
            setUsers();
        });
    };
    setCategories();
    el.addCategory.onclick = ()=>{
        if(el.categoryName.value) insertCategory(el.categoryName.value).then(()=>{
            el.categoryName.value = "";
            setCategories();
        });
    };
    el.addTodo.onclick = ()=>{
        if(model.currentUser && model.currentCategory && el.todo.value) insertTodo(el.todo.value).then(()=>{
            setTodo();
        });
    }
    if(model.currentCategory) setTodo();
};
init();