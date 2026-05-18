import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="authPage">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/app"
      />
    </main>
  );
}
