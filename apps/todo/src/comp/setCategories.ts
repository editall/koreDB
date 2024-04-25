import {el} from "../el.ts";
import {categoryList} from "../dto/dtoCategory.ts";
import {model} from "../model.ts";
import {setTodo} from "./setTodo.ts";

export const setCategories = async () => {
    el.categoryList.innerHTML = "";
    (await categoryList()).forEach((c: any) => {
        const li = document.createElement("li");
        li.innerHTML = model.currentCategory === c.id ? `<strong>${c.name}</strong>` : c.name;
        li.onclick = () => {
            model.currentCategory = c.id;
            setCategories();
            setTodo();
        };
    });
};