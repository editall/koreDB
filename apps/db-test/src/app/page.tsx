"use client";
import { Viewport } from "next";
import {DB, Table, TableWrapper} from "@edit-all/kore-db";

class Member extends Table<Member>{
    $rowid: number;
    name: string;
}
class Club extends Table<Club>{
    $rowid: number;
    name: string;
}
class MemberClub extends Table<MemberClub>{
    $rowid: number;
    member_rowid:number;
    club_rowid:number;
}
class TestDB extends DB{
  constructor(dbName: string) {
    super(dbName);
  }
  onCreate(f: <TABLE extends Table<TABLE>>(tableClass: { new(): TABLE }) => TableWrapper<TABLE>): void {
    f(Member).index("name");
    f(Club).index("name");
    f(MemberClub).index("member_rowid").index("club_rowid");
  }
  async onInit(): Promise<void> {
    return Promise.resolve(undefined);
  }
  onError(e: Event): void {
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Home() {
  const testDB = new TestDB("test");
  return "hello";
}
