import {getModel} from "../model.ts";
import {el} from "../el.ts";
import {doneTodo, todoList} from "../dto/dtoTodo.ts";

export const setTodo = async () => {
    if(!getModel().category){
        el.todos.style.display = "none";
        return;
    }
    el.todos.style.display = "block";
    el.todoList.innerHTML = "";
    el.doneList.innerHTML = "";
    el.todoTitle.value = "";
    (await todoList(false)).forEach((t: any) => {
       const li = document.createElement("li");
       li.innerHTML = t.title;
       li.onclick = async ()=>{
           await doneTodo(t.id, true);
           await setTodo();
       }
       el.todoList.appendChild(li);
    });
    (await todoList(true)).forEach((t: any) => {
        const li = document.createElement("li");
        li.innerHTML = t.title;
        li.style.textDecoration = "line-through";
        li.onclick = async ()=>{
            await doneTodo(t.id, false);
            await setTodo();
        }
        el.doneList.appendChild(li);
    });
};