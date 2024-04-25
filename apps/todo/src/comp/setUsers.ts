import {el} from "../el.ts";
import {userList} from "../dto/dtoUser.ts";
import {getModel} from "../model.ts";
import {setCategories} from "./setCategories.ts";

export const setUsers = async () => {
    el.userList.innerHTML = "<option value='0'>Select User</option>";
    (await userList()).forEach((u: any) => {
        const option = document.createElement("option");
        option.value = u.id;
        option.textContent = `${u.name}: ${u.email}`;
        if (u.id === getModel().user) option.selected = true;
        el.userList.appendChild(option);
    });
    await setCategories();
};