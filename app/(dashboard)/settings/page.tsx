import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" />
      <div className="p-6 space-y-4 animate-fade-in">
        <div className="rounded-xl border border-border bg-surface p-6 max-w-md">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Perfil</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-text-muted">Nombre</dt>
              <dd className="text-sm font-medium text-text-primary">{session?.user?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-text-muted">Email</dt>
              <dd className="text-sm font-medium text-text-primary">{session?.user?.email}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 max-w-md">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Empresa</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-text-muted">Nombre</dt>
              <dd className="text-sm font-medium text-text-primary">NODO</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-text-muted">Tagline</dt>
              <dd className="text-sm font-medium text-text-primary">AI Agents Studio</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-text-muted">Stack</dt>
              <dd className="text-sm font-medium text-text-primary">Claude + n8n + OpenClaw</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
