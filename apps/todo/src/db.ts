import {CreateTable, DB, Table} from "@edit-all/kore-db";

class Model extends Table<Model> {
    $rowid!:number;
    user!:number;
    category!:number;
}
class Category extends Table<Category> {
    $rowid!: number;
    name!: string;
}
class Tag extends Table<Tag> {
    $rowid!: number;
    name!: string;
}
class Todo extends Table<Todo> {
    $rowid!: number;
    parent_rowid!: number;
    category_rowid!: number;
    title!: string;
    content!: string;
    isDone!: boolean;
    when!: Date;
    tags!: number[];
    subTodos!: number[];
    owner_rowid!: number;
    assignee_rowid!: number;
}
class User extends Table<User> {
    $rowid!: number;
    name!: string;
    email!: string;
}
class TodoDB extends DB {
    onCreate(table: CreateTable): void {
        table(Category).index("name");
        table(Tag).index("name");
        table(Todo).index("title").index("isDone").index("when");
        table(User).index("name").index("email");
        table(Model);
    }
    async onInit(): Promise<void> {
        await this.insert(Model, new Model().from({user:0, category:0}));
    }
    onError(e: Event): void {
        console.error(e);
    }
}
const todoDB = new TodoDB();

export { Model, Category, Tag, Todo, User, todoDB };