import {Category, todoDB} from "../db.ts";
import {getModel} from "../model.ts";

const insertCategory = async (name:string)=> await todoDB.insert(Category, new Category().from({name, user_rowid:getModel().user}));

// Category 삭제
const qDeleteCategory = todoDB.delete(Category, (query, c)=>{
    query.E(c, "$rowid", 0, "id")
});
const deleteCategory = async (id:number)=> (await qDeleteCategory).query({id});

// Category 업데이트
const qUpdateCategory = todoDB.update(Category, (query, c)=>{
    query.setFieldParam( "name", 1, "name")
        .E(c, "$rowid", 0, "rowid")
});
const updateCategory = async (category:Category)=>{
    if(!category.$rowid) throw new Error("category.$rowid is required");
    const {$rowid:rowid, name} = category;
    if(name) await (await qUpdateCategory).query({rowid}, {name});
}

// Category 목록 조회
const qCategoryList = todoDB.select(Category, (query, c)=>{
    query.project(c, "$rowid", "id")
        .project(c, "name")
        .E(c, "user_rowid", 0, "user")
        .orderBy("name")
});
const categoryList = async ()=> (await qCategoryList).query(getModel());

export {insertCategory, deleteCategory, updateCategory, categoryList};