# koreDB

IndexedDB wrapper like RDB (CRUD, left inner join, where, order)

## run sample
```bash
pnpm sample dev
pnpm todo dev
```
## Usage
all code is in [apps/vite-project/src/main.ts](apps/vite-project/src/main.ts)

### 1. Define schema
Defining a static schema by inheriting from the Table class.
```typescript
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
```

### 2. Make Database instance
```typescript
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
        console.log("onInit");
        await this.insert(Member,
            new Member().from({name:"hika"}),
            new Member().from({name:"jidolstar"}),
            new Member().from({name:"boeun"})
        );
        await this.insert(Club,
            new Club().from({name:"baseball"}),
            new Club().from({name:"football"}),
            new Club().from({name:"swimming"})
        );
        await this.insert(MemberClub,
            new MemberClub().from({club_rowid:1, member_rowid:1}),
            new MemberClub().from({club_rowid:1, member_rowid:2}),
            new MemberClub().from({club_rowid:2, member_rowid:2}),
            new MemberClub().from({club_rowid:2, member_rowid:3}),
            new MemberClub().from({club_rowid:3, member_rowid:1}),
            new MemberClub().from({club_rowid:3, member_rowid:3})
        );
    }
    onError(e:Event):void{
        console.error(e);
    }
}

const testDB = new TestDB("test");
```

### 3. Make query
```sql
select member.rowid as memberId, member.name as memberName, club.rowid as clubId, club.name as clubName
select member.*, memberClub.*, club.*
from Member member
left inner join MemberClub memberClub on member.rowid = memberClub.member_rowid
left inner join Club club on memberClub.club_rowid = club.rowid
where member.name = "hika" or club.name = "baseball"
order by memberId, clubId
```
to Kore DB query
```typescript
const query1 = await testDB.select(Member, (query, member)=>{
    const memberClub = member.join(MemberClub, "member_rowid", "$rowid")
    const club = memberClub.join(Club, "$rowid", "club_rowid")
    query.project(member, "$rowid", "memberId")
        .project(member, "name", "memberName")
        .project(club, "$rowid", "clubId")
        .project(club, "name", "clubName")
        .E(member, "name", 0, "memberName")
        .OR.E(club, "name", 0, "clubName")
        .orderBy("memberId")
        .orderBy("clubId")
});
```

### 4. run query
```typescript
const v = await query1.query({memberName:"hika", clubName:"baseball"});
console.log(v);
```
and result is
```json
[
  {"memberId":1,"memberName":"hika","clubId":1,"clubName":"baseball"},
  {"memberId":1,"memberName":"hika","clubId":1,"clubName":"baseball"},
  {"memberId":1,"memberName":"hika","clubId":3,"clubName":"swimming"},
  {"memberId":2,"memberName":"jidolstar","clubId":1,"clubName":"baseball"}
]
```