import { createClient } from "@libsql/client";
const db = createClient({ url: "file:payload-phase5-test.db" });
const r = db.execute("SELECT id, title, publishedAt FROM blogs");
console.log(JSON.stringify(r.rows));
