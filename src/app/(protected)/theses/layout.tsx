// app/theses/layout.tsx

// import ThesisBookPhoto from "./_compoents/photoModal";
import UpsertThesis from "./_compoents/upsertThesis";
import ThesesQRModal from "./_compoents/qrModal";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThesesQRModal />
      <UpsertThesis />
      {/* <ThesisBookPhoto /> */}
      {children}
    </>
  );
}
