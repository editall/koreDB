
// Todo 생성
import {Todo, todoDB} from "../db.ts";
import {getModel} from "../model.ts";

const insertTodo = async (title:string)=> await todoDB.insert(Todo, new Todo().from({
    title, content:"", isDone:false, when:new Date(0), subTodos:[], owner_rowid:getModel().user, assignee_rowid:0,
    parent_rowid:0, category_rowid:getModel().category, tags:[]
}));

// Todo 삭제
const qDeleteTodo = todoDB.delete(Todo, (query, t)=>{
    query.E(t, "$rowid", 0, "id")
});
const deleteTodo = async (id:number)=> (await qDeleteTodo).query({id});

// Todo 업데이트
const qUpdateTodo = todoDB.update(Todo, (query, t)=>{
    query.setFieldParam( "title", 1, "title")
        .setFieldParam( "content", 2, "content")
        .setFieldParam( "isDone", 3, "isDone")
        .setFieldParam( "when", 4, "when")
        .setFieldParam( "owner_rowid", 5, "owner_rowid")
        .setFieldParam( "assignee_rowid", 6, "assignee_rowid")
        .E(t, "$rowid", 0, "rowid")
});
const updateTodo = async (todo:Todo)=>{
    if(!todo.$rowid) throw new Error("todo.$rowid is required");
    const q = (await qUpdateTodo), {$rowid:rowid, title, content, isDone, when, owner_rowid, assignee_rowid} = todo;
    if(title || content || isDone !== undefined || when || owner_rowid || assignee_rowid) q.query({rowid}, {title, content, isDone, when, owner_rowid, assignee_rowid});
}

// Todo 목록 조회 (isDone 기준)
const qTodoList = todoDB.select(Todo, (query, t)=>{
    query.project(t, "$rowid", "id")
        .project(t, "title")
        .project(t, "content")
        .project(t, "isDone")
        .project(t, "when")
        .project(t, "owner_rowid")
        .project(t, "assignee_rowid")
        .E(t,"isDone", 0, "isDone")
});
const todoList = async (isDone:boolean)=> (await qTodoList).query({isDone});

export {insertTodo, deleteTodo, updateTodo, todoList};