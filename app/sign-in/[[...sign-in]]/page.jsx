import { SignIn } from "@clerk/nextjs";

const ptBR = {
  locale: "pt-BR",
  socialButtonsBlockButton: "Continuar com {{provider}}",
  dividerText: "ou",
  formFieldLabel__emailAddress: "E-mail",
  formFieldLabel__password: "Senha",
  formFieldLabel__firstName: "Nome",
  formFieldLabel__lastName: "Sobrenome",
  formFieldLabel__username: "Nome de usuário",
  formFieldPlaceholder__emailAddress: "seu@email.com",
  formFieldPlaceholder__password: "Sua senha",
  formButtonPrimary: "Continuar",
  footerActionLink__useAnotherMethod: "Usar outro método",
  badge__primary: "Principal",
  badge__thisDevice: "Este dispositivo",
  badge__userDevice: "Dispositivo do usuário",
  badge__otherIssues: "Outros problemas",
  signUp: {
    start: {
      title: "Crie sua conta",
      subtitle: "para continuar no CAA Neuro",
      actionText: "Já tem uma conta?",
      actionLink: "Entrar",
    },
  },
  signIn: {
    start: {
      title: "Entre na sua conta",
      subtitle: "para continuar no CAA Neuro",
      actionText: "Não tem uma conta?",
      actionLink: "Criar conta",
    },
  },
  userButton: {
    action__signOut: "Sair",
    action__signOutAll: "Sair de todas as contas",
    action__manageAccount: "Gerenciar conta",
  },
  userProfile: {
    navbar: {
      title: "Perfil",
      description: "Gerencie as informações da sua conta",
      account: "Conta",
      security: "Segurança",
    },
  },
};

export default function Page() {
  return (
    <main className="authPage">
      <div style={{textAlign:"center",marginBottom:"24px",padding:"0 16px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 6px"}}>
          Bem-vindo de volta 👋
        </h2>
        <p style={{color:"#6b7280",fontSize:"14px",margin:0}}>
          Entre com seu e-mail ou conta do Google
        </p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/app"
        forceRedirectUrl="/app"
        localization={ptBR}
      />
    </main>
  );
}
