"use client";
import { DB, Table, TableWrapper } from "@edit-all/kore-db";

export function Client() {
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
  return "hello";
}
