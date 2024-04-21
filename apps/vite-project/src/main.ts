import './style.css'
import {DB, Table, TableWrapper} from "@edit-all/kore-db";

class Member extends Table<Member> {
    $rowid!: number;
    name!: string;
}
class Club extends Table<Club> {
    $rowid!: number;
    name!: string;
}
class MemberClub extends Table<MemberClub> {
    $rowid!: number;
    member_rowid!: number;
    club_rowid!: number;
}
class TestDB extends DB {
    constructor(dbName: string) {
        super(dbName);
    }
    onCreate(
        f: <TABLE extends Table<TABLE>>(tableClass: {
            new (): TABLE;
        }) => TableWrapper<TABLE>
    ): void {
        f(Member).index("name");
        f(Club).index("name");
        f(MemberClub).index("member_rowid").index("club_rowid");
    }
    async onInit(): Promise<void> {
        return Promise.resolve(undefined);
    }
    onError(e: Event): void {
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


const query1 = testDB.select(Member, (query, member)=>{
    const memberClub = member.join(MemberClub, "member_rowid", "$rowid")
    const club = memberClub.join(Club, "$rowid", "club_rowid")
    query.project(member, "$rowid", "memberId")
        .project(member,"name", "memberName")
        .project(club,"$rowid", "clubId")
        .project(club, "name", "clubName")
        .equal(member, "$rowid", 0, "a").and()
        .equal(member, "name", 1, "b").and()
        .equal(club, "name", 1, "c")
        .orderBy("memberId").orderBy("clubId")


});

query1.query({a:1}, {b:"hika"})
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div>hello</div>`