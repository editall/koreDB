const getId = (id:string)=> document.getElementById(id)! as HTMLElement;
const createEl = (tag:string)=> document.createElement(tag) as HTMLElement;
const el = {
    userList: getId("userList")! as HTMLSelectElement,
    removeUser: getId("removeUser")!,
    userName: getId("userName")! as HTMLInputElement,
    userEmail: getId("userEmail")! as HTMLInputElement,
    addUser: getId("addUser")!,
    categoryList: getId("categoryList")!,
    categoryName: getId("categoryName")! as HTMLInputElement,
    addCategory: getId("addCategory")!,
    categoryTitle: getId("categoryTitle")!,
    todos: getId("todos")!,
    todoTitle: getId("todoTitle")! as HTMLInputElement,
    addTodo: getId("addTodo")!,
    todoList: getId("todoList")!,
    doneList: getId("doneList")!,
};
const trash = (block:(e:MouseEvent)=>Promise<void>)=>{
    const span = createEl("span");
    span.innerHTML = "🗑️";
    span.onclick = async (e:MouseEvent)=>{
        e.stopImmediatePropagation();
        await block(e);
    };
    return span;
};
const changeNewEl = async (elKey:keyof typeof el, block:(el:HTMLElement)=>Promise<void>)=>{
    const target = el[elKey] as HTMLElement;
    const newEl = target.cloneNode(false) as HTMLElement;
    await block(newEl);
    target.parentNode!.replaceChild(newEl, target);
    el[elKey] = newEl as any;
};
export {el, trash, changeNewEl};