import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="authPage">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/app"
      />
    </main>
  );
}
