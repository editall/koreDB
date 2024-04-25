import {changeNewEl, el, trash} from "../el.ts";
import {categoryList, deleteCategory} from "../dto/dtoCategory.ts";
import {setTodo} from "./setTodo.ts";
import {getModel, setModel} from "../model.ts";

export const setCategories = async () => {
    await changeNewEl("categoryList", async (newEl)=> {
        const cat = getModel().category;
        (await categoryList()).forEach((c: any) => {
            if (cat === c.id) el.categoryTitle.innerHTML = c.name;
            const li = document.createElement("li");
            li.innerHTML = cat === c.id ? `<strong>${c.name}</strong>` : c.name;
            li.appendChild(trash(async () => {
                if (getModel().category === c.id) await setModel(undefined, 0);
                await deleteCategory(c.id);
                await setCategories();
            }));
            li.onclick = async () => {
                await setModel(undefined, c.id);
                await setCategories();
            };
            newEl.appendChild(li);
        });
    });
    if(!getModel().category) el.todos.style.display = "none"; else{
        el.todoTitle.value = "";
        el.todos.style.display = "block";
        await setTodo();
    }
};