import {Category, todoDB} from "../db.ts";

const insertCategory = async (name:string)=> await todoDB.insert(Category, new Category().from({name}));

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
    if(name) (await qUpdateCategory).query({rowid}, {name});
}

// Category 목록 조회
const qCategoryList = todoDB.select(Category, (query, c)=>{
    query.project(c, "$rowid", "id")
        .project(c, "name")
        .orderBy("name")
});
const categoryList = async ()=> (await qCategoryList).query();

export {insertCategory, deleteCategory, updateCategory, categoryList};