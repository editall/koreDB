import {el} from "../el.ts";
import {categoryList} from "../dto/dtoCategory.ts";
import {setTodo} from "./setTodo.ts";
import {getModel, setModel} from "../model.ts";

export const setCategories = async () => {
    el.categoryList.innerHTML = "";
    (await categoryList()).forEach((c: any) => {
        const li = document.createElement("li");
        li.innerHTML = getModel().category === c.id ? `<strong>${c.name}</strong>` : c.name;
        li.onclick = () => {
            setModel(undefined, c.id);
            setCategories();
            setTodo();
        };
        el.categoryList.appendChild(li);
    });
};