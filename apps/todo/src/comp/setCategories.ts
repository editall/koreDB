import {el} from "../el.ts";
import {categoryList, deleteCategory} from "../dto/dtoCategory.ts";
import {setTodo} from "./setTodo.ts";
import {getModel, setModel} from "../model.ts";

export const setCategories = async () => {
    el.categoryList.innerHTML = "";
    const cat = getModel().category;
    (await categoryList()).forEach((c: any) => {
        const li = document.createElement("li");
        li.innerHTML = cat === c.id ? `<strong>${c.name}</strong>` : c.name;
        const trash = document.createElement("span");
        trash.innerHTML = "🗑️";
        trash.onclick = async () => {
            if(getModel().category === c.id) await setModel(undefined, 0);
            await deleteCategory(c.id);
            await setCategories();
            await setTodo();
        };
        li.appendChild(trash);
        li.onclick = async () => {
            await setModel(undefined, c.id);
            await setCategories();
            await setTodo();
        };
        el.categoryList.appendChild(li);
    });
};