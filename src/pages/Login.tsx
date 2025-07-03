import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

type User = {
  id: number;
  nome: string;
  email: string;
};

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userAuth");
    try {
      if (stored && stored !== "undefined") {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        navigate("/home");
      }
    } catch (err) {
      console.error("Erro ao carregar usuário do localStorage:", err);
      localStorage.removeItem("userAuth"); // limpa dado inválido
    }
  }, [navigate]);

  const resetFields = () => {
    setEmail("");
    setSenha("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/login", {
        email,
        senha,
      });

      const { token } = res.data;
      const user = {
        id: res.data.id,
        nome: res.data.nome,
        email: res.data.email,
        is_admin: res.data.is_admin,
      };

      localStorage.setItem("tokenAuth", token);
      localStorage.setItem("userAuth", JSON.stringify(user));

      toast.success("Login realizado com sucesso!");

      setUser(user);
      resetFields();
      navigate("/home");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Erro ao fazer login. Verifique os dados.";
      toast.error(message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/reset-senha", {
        email,
      });

      toast.success("E-mail de recuperação enviado com sucesso!");
      setMode("login");
      resetFields();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Erro ao enviar e-mail de recuperação.";
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {mode === "login" ? "Login" : "Recuperar Senha"}
        </h2>

        <form
          onSubmit={mode === "login" ? handleLogin : handleResetPassword}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="email@exemplo.com"
            />
          </div>

          {mode === "login" && (
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">
                Senha
              </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "reset" : "login")}
              className="text-sm text-blue-600 hover:underline"
            >
              {mode === "login" ? "Esqueci a senha" : "Voltar para login"}
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {mode === "login" ? "Entrar" : "Recuperar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
