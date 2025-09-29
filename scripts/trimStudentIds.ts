import { appRouter } from "@/server/api/root";
import { db } from "@/server/db";

async function main() {
  await appRouter
    .createCaller({ db, headers: {} as Headers, session: null })
    .script.students.trimStudentIds();

  console.log("✅ All studentIds trimmed");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
