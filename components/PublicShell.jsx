import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

export default function PublicShell({ children }) {
  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}
