import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

class Member extends Table<Member> {
    $rowid: number;
    name: string;
}
class Club extends Table<Club> {
    $rowid: number;
    name: string;
}
class MemberClub extends Table<MemberClub> {
    $rowid: number;
    member_rowid: number;
    club_rowid: number;
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
    onError(e: Event): void {}
}

const testDB = new TestDB("test");
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
