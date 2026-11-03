import { Breadcrumbs } from "../components/Breadcrumbs";
import { useTheme } from "../contexts/ThemeContext";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Configurações" }]} />
      <h1 className="text-3xl font-bold text-[#212529] dark:text-white mb-6">Configurações</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader title="Aparência" subtitle="Personalize a aparência do portal" />
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#212529] dark:text-white">Modo {theme === "light" ? "Claro" : "Escuro"}</p>
                <p className="text-sm text-[#6c757d] dark:text-gray-400">
                  {theme === "light" ? "Tema claro ativo" : "Tema escuro ativo"}
                </p>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                Alternar para {theme === "light" ? "Escuro" : "Claro"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader title="Privacidade" subtitle="Gerencie suas configurações de privacidade" />
          <CardContent>
            <p className="text-[#6c757d] dark:text-gray-400">Em breve...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

