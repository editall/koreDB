import {Todo, todoDB} from "../db.ts";
import {getModel} from "../model.ts";

const insertTodo = async (title:string)=> await todoDB.insert(Todo, new Todo().from({
    title,
    category_rowid:getModel().category,
    content:"", isDone:false, when:new Date(0), subTodos:[], assignee_rowid:0,
    parent_rowid:0, tags:[]
}));

const qDeleteTodo = todoDB.delete(Todo, (query, t)=>{
    query.E(t, "$rowid", 0, "id")
});
const deleteTodo = async (id:number)=> (await qDeleteTodo).query({id});

const qDoneTodo = todoDB.update(Todo, (query, t)=>{
    query.setFieldParam( "isDone", 0, "isDone")
        .E(t, "$rowid", 0, "id")
});
const doneTodo = async (id:number, isDone:boolean)=>{
    await (await qDoneTodo).query({id, isDone});
};

const qTodoList = todoDB.select(Todo, (query, t)=>{
    query.project(t, "$rowid", "id")
        .project(t, "title")
        .project(t, "content")
        .project(t, "isDone")
        .project(t, "when")
        .project(t, "assignee_rowid")
        .E(t,"isDone", 0, "isDone")
        .AND.E(t, "category_rowid", 0, "category")
        .AND.E(t, "parent_rowid", 0, "parent")
});
const todoList = async (isDone:boolean)=> (await qTodoList).query({isDone, category:getModel().category, parent:0});

export {insertTodo, deleteTodo, doneTodo, todoList};