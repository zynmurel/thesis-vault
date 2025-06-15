// app/theses/layout.tsx

import ThesisBookPhoto from "./_compoents/photoModal";
import UpsertThesis from "./_compoents/upsertThesis";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UpsertThesis />
      <ThesisBookPhoto />
      {children}
    </>
  );
}
