import './style.css'
import {DB, Table, CreateTable} from "@edit-all/kore-db";

class Member extends Table<Member>{
    $rowid!:number;
    name!:string;
}

class Club extends Table<Club>{
    $rowid!:number;
    name!:string;
}

class MemberClub extends Table<MemberClub>{
    $rowid!:number;
    member_rowid!:number;
    club_rowid!:number;
}

class TestDB extends DB{
    constructor(dbName:string){
        super(dbName);
    }
    onCreate(table:CreateTable):void{
        table(Member).index("name");
        table(Club).index("name");
        table(MemberClub).index("member_rowid").index("club_rowid");
    }
    async onInit():Promise<void>{

        return Promise.resolve(undefined);
    }
    onError(e:Event):void{
        console.error(e);
    }
}

const testDB = new TestDB("test");
/*
select member.rowid as memberId, member.name as memberName, club.rowid as clubId, club.name as clubName
select member.*, memberClub.*, club.*
from Member member
left inner join MemberClub memberClub on member.rowid = memberClub.member_rowid
left inner join Club club on memberClub.club_rowid = club.rowid
 */
const query1 = await testDB.select(Member, (query, m)=>{
    const mc = m.join(MemberClub, "member_rowid", "$rowid")
    const c = mc.join(Club, "$rowid", "club_rowid")
    query.project(m, "$rowid", "memberId").project(m, "name", "memberName").project(c, "$rowid", "clubId").project(c, "name", "clubName").E(m, "$rowid", 0, "a").AND.E(m, "name", 1, "b").AND.E(c, "name", 1, "c").orderBy("memberId").orderBy("clubId")
});
const m = new Member().from({$rowid:1, name:"hika"});
const v = await query1.query({a:1}, {b:"hika"});
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div>${JSON.stringify(v)}</div>`