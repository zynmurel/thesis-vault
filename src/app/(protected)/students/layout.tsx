import AddStudentModal from "./_compoents/addStudentModal";
import UploadStudentsModal from "./_compoents/uploadStudentsModal";

// app/theses/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AddStudentModal />
      <UploadStudentsModal />
      {children}
    </>
  );
}
