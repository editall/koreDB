import {changeNewEl, trash} from "../el.ts";
import {deleteTodo, doneTodo, todoList} from "../dto/dtoTodo.ts";

export const setTodo = async () => {
    await changeNewEl("todoList", async (newEl)=> {
        (await todoList(false)).forEach((t: any) => {
            const li = document.createElement("li");
            li.innerHTML = t.title;
            li.appendChild(trash(async () => {
                await deleteTodo(t.id);
                await setTodo();
            }));
            li.onclick = async () => {
                await doneTodo(t.id, true);
                await setTodo();
            }
            newEl.appendChild(li);
        });
    });
    await changeNewEl("doneList", async (newEl)=> {
        (await todoList(true)).forEach((t: any) => {
            const li = document.createElement("li");
            li.innerHTML = t.title;
            li.style.textDecoration = "line-through";
            li.onclick = async () => {
                await doneTodo(t.id, false);
                await setTodo();
            }
            newEl.appendChild(li);
        });
    });
};