import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Edit, Trash } from "lucide-react";
import Modal from "../../components/Modal";

interface User {
  id: number;
  nome: string;
  email: string;
  is_admin: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", is_admin: false });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const res = await axios.get("http://localhost:3000/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      toast.error("Erro ao carregar usuários.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditData(user);
      setForm({ nome: user.nome, email: user.email, senha: "", is_admin: user.is_admin });
    } else {
      setEditData(null);
      setForm({ nome: "", email: "", senha: "", is_admin: false });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nome.trim() || !form.email.trim() || (!editData && !form.senha.trim())) {
      toast.warning("Por favor, preencha nome, email e senha.");
      return;
    }

    try {
      const token = localStorage.getItem("tokenAuth");
      const payload: any = {
        nome: form.nome,
        email: form.email,
        is_admin: form.is_admin,
      };

      // Só envia senha se estiver criando ou se for edição com senha preenchida
      if (!editData || (editData && form.senha.trim() !== "")) {
        payload.senha = form.senha;
      }

      if (editData) {
        await axios.put(`http://localhost:3000/usuarios/${editData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await axios.post("http://localhost:3000/usuarios", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Usuário criado com sucesso!");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      toast.error("Erro ao salvar usuário.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const token = localStorage.getItem("tokenAuth");
      await axios.delete(`http://localhost:3000/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Usuário excluído com sucesso!");
      fetchUsers();
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      toast.error("Erro ao excluir usuário.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-gray-600">
          Gerencie os usuários, incluindo criação, edição e exclusão.
        </p>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
        <button
          type="button"
          onClick={() => openModal()}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          <Plus size={18} className="mr-2" /> Novo Usuário
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Administrador</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-300 dark:border-gray-700">
                  <td className="p-2">{user.id}</td>
                  <td className="p-2">{user.nome}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.is_admin ? "Sim" : "Não"}</td>
                  <td className="p-2 space-x-2">
                    <button
                      title="Editar"
                      type="button"
                      onClick={() => openModal(user)}
                      className="text-blue-600 hover:underline"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      title="Excluir"
                      type="button"
                      onClick={() => {
                        setEditData(user);
                        setModalDeleteOpen(true);
                      }}
                      className="text-red-600 hover:underline"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500 dark:text-gray-400">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          title={editData ? "Editar Usuário" : "Novo Usuário"}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block font-medium text-gray-700 dark:text-gray-300"
              >
                Nome *
              </label>
              <input
                id="nome"
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-700 dark:text-gray-300"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block font-medium text-gray-700 dark:text-gray-300"
              >
                Senha {editData ? "(Preencha apenas para alterar)" : "*"}
              </label>
              <input
                id="senha"
                type="password"
                value={form.senha}
                onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                placeholder={editData ? "Deixe vazio para manter a senha atual" : "Senha"}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is_admin"
                type="checkbox"
                checked={form.is_admin}
                onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
                className="cursor-pointer"
              />
              <label
                htmlFor="is_admin"
                className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Administrador
              </label>
            </div>

            <div className="text-right">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editData ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Excluir */}
      {modalDeleteOpen && editData && (
        <Modal
          isOpen={modalDeleteOpen}
          onClose={() => {
            setModalDeleteOpen(false);
            setEditData(null);
          }}
          title="Excluir Usuário"
        >
          <div className="space-y-4 text-gray-800 dark:text-gray-200">
            <p>Tem certeza que deseja excluir o usuário abaixo?</p>
            <div className="p-4 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p>
                <strong>ID:</strong> {editData.id}
              </p>
              <p>
                <strong>Nome:</strong> {editData.nome}
              </p>
              <p>
                <strong>Email:</strong> {editData.email}
              </p>
            </div>

            <div className="text-right space-x-2 mt-4">
              <button
                onClick={() => {
                  setModalDeleteOpen(false);
                  setEditData(null);
                }}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (editData) await handleDelete(editData.id);
                  setModalDeleteOpen(false);
                  setEditData(null);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Users;
