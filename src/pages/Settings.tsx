import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("");
  const [language, setLanguage] = useState("pt");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load saved settings
  useEffect(() => {
    const storedDark = localStorage.getItem("darkMode") === "true";
    const storedNotifications =
      localStorage.getItem("notifications") === "true";
    const storedLang = localStorage.getItem("language") || "pt";

    // setDarkMode(storedDark);
    setNotificationsEnabled(storedNotifications);
    setLanguage(storedLang);

    // aplica ou remove o modo escuro logo ao iniciar
    if (storedDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("notifications", String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const handleNotificationToggle = async () => {
    if (!("Notification" in window)) {
      setNotificationStatus("Seu navegador não suporta notificações.");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled((prev) => !prev);
      setNotificationStatus("");
    } else if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        setNotificationStatus("");
      } else {
        setNotificationStatus("Permissão negada.");
      }
    } else {
      setNotificationStatus("Notificações bloqueadas no navegador.");
    }
  };

  const handleChangePassword = () => {
    // Aqui você pode abrir modal ou navegar para página de troca de senha
    setShowPasswordModal(true);
  };

  const handleDeleteAccount = () => {
    // Chamada de API real seria aqui
    alert("Conta excluída (simulação).");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex-1 flex">
      <div className="flex-1 p-8 pb-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Configurações da Conta
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Ajuste suas preferências pessoais.
            </p>
          </div>

          <div className="space-y-6">
            {/* Modo Escuro */}
            <SettingItem
              title="Modo Escuro"
              description="Ative ou desative o tema escuro."
              control={<Toggle checked={darkMode} onChange={toggleDarkMode} />}
            />

            {/* Notificações */}
            <SettingItem
              title="Notificações"
              description="Ative notificações push se permitido pelo navegador."
              control={
                <button
                  onClick={handleNotificationToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    notificationsEnabled
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  {notificationsEnabled ? "Ativadas" : "Desativadas"}
                </button>
              }
            />
            {notificationStatus && (
              <p className="text-sm text-red-500">{notificationStatus}</p>
            )}

            {/* Idioma */}
            <SettingItem
              title="Idioma"
              description="Escolha o idioma da plataforma."
              control={
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                  aria-label="Selecionar idioma"
                >
                  <option value="pt">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
              }
            />

            {/* Alterar senha */}
            <SettingItem
              title="Alterar Senha"
              description="Troque sua senha de acesso."
              control={
                <button
                  className="text-blue-600 hover:underline"
                  onClick={handleChangePassword}
                >
                  Alterar
                </button>
              }
            />

            {/* Excluir conta */}
            <SettingItem
              title="Excluir Conta"
              description="Esta ação é irreversível!"
              control={
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Excluir
                </button>
              }
            />
          </div>

          <p className="text-center text-xs text-gray-400 mt-12">
            Suas preferências são salvas localmente.
          </p>
        </div>

        {/* Modal de alterar senha */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
              <input
                type="password"
                placeholder="Nova senha"
                className="w-full border px-4 py-2 rounded-lg mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => {
                    alert("Senha alterada (simulação)");
                    setShowPasswordModal(false);
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal excluir conta */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Tem certeza que deseja excluir sua conta?
              </h3>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  onClick={handleDeleteAccount}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

const SettingItem = ({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) => (
  <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    {control}
  </div>
);

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only"
      checked={checked}
      onChange={onChange}
      aria-label="Alternar modo escuro"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 relative transition-all">
      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-5 transition-transform" />
    </div>
  </label>
);
