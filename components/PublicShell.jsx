import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

export default function PublicShell({ children }) {
  return (
    <div className="publicShell">
      <PublicHeader />
      <div className="publicShellBody">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
