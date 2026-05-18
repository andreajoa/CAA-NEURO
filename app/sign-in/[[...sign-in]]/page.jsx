import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"#f0fdf7"
    }}>
      <SignIn
        forceRedirectUrl="/app"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
