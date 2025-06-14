// app/theses/layout.tsx

import UpsertThesis from "./_compoents/upsertThesis";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UpsertThesis />
      {children}
    </>
  );
}
