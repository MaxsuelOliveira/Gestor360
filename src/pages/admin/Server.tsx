import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Edit, Trash, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import Modal from "../../components/Modal";

interface Empresa {
  id: number;
  razao_social: string;
  cnpj: string;
}
interface Servidor {
  id: number;
  empresa_id: number;
  host: string;
  user: string;
  senha: string;
  data_criacao: string;
  empresa: Empresa;
}

const Server = () => {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Servidor | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [form, setForm] = useState({ empresa_id: "", host: "", user: "", senha: "" });

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const [srvRes, empRes] = await Promise.all([
        axios.get("http://localhost:3000/servidores", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/empresas", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setEmpresas(empRes.data);
      const filtrados = srvRes.data.filter((grupo: any) => {
        return (
          grupo.empresa.razao_social.toLowerCase().includes(search.toLowerCase()) ||
          grupo.servidores.some((srv: Servidor) =>
            srv.host.toLowerCase().includes(search.toLowerCase())
          )
        );
      });
      const ordenados = filtrados.sort((a: any, b: any) =>
        sortAsc
          ? a.empresa.razao_social.localeCompare(b.empresa.razao_social)
          : b.empresa.razao_social.localeCompare(a.empresa.razao_social)
      );
      setGrupos(ordenados);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar servidores ou empresas.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search, sortAsc]);

  const openModal = (srv?: Servidor) => {
    if (srv) {
      setEditData(srv);
      setForm({ empresa_id: String(srv.empresa_id), host: srv.host, user: srv.user, senha: srv.senha });
    } else {
      setEditData(null);
      setForm({ empresa_id: "", host: "", user: "", senha: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const payload = { ...form, empresa_id: Number(form.empresa_id) };
      if (editData) {
        await axios.put(`http://localhost:3000/servidores/${editData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Servidor atualizado!");
      } else {
        await axios.post("http://localhost:3000/servidores", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Servidor criado!");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar servidor.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este servidor?")) return;
    try {
      const token = localStorage.getItem("tokenAuth");
      await axios.delete(`http://localhost:3000/servidores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Servidor excluído!");
      fetchAll();
    } catch {
      toast.error("Erro ao excluir servidor.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Servidores</h1>
        <p className="text-gray-600">Gerencie os servidores para acesso remoto e suporte técnico.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar host ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-sm dark:bg-gray-800 dark:border-gray-700"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sortAsc ? <ArrowDownAZ size={18} /> : <ArrowUpAZ size={18} />}
          </button>
          <button
            onClick={() => openModal()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={18} className="inline mr-2" /> Novo Servidor
          </button>
        </div>
      </div>

      {grupos.map((grupo) => (
        <div key={grupo.empresa.id} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {grupo.empresa.razao_social} - CNPJ: {grupo.empresa.cnpj}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupo.servidores.map((srv: Servidor) => (
              <div
                key={srv.id}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-blue-600 mb-1">{srv.host}</h2>
                  <p className="text-sm">
                    <strong>Usuário:</strong> {srv.user}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openModal(srv)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditData(srv);
                      setModalDeleteOpen(true);
                    }}
                    className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          title={editData ? "Editar Servidor" : "Novo Servidor"}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block">Empresa *</label>
              <select
                value={form.empresa_id}
                onChange={(e) => setForm({ ...form, empresa_id: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Selecione...</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.razao_social}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Host *</label>
              <input
                type="text"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block">Usuário *</label>
              <input
                type="text"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block">Senha *</label>
              <input
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
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

      {modalDeleteOpen && editData && (
        <Modal
          isOpen={modalDeleteOpen}
          title="Excluir Servidor"
          onClose={() => {
            setModalDeleteOpen(false);
            setEditData(null);
          }}
        >
          <div className="space-y-4">
            <p>Deseja excluir o servidor <strong>{editData.host}</strong>?</p>
            <div className="text-right">
              <button
                onClick={async () => {
                  await handleDelete(editData.id);
                  setModalDeleteOpen(false);
                  setEditData(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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

export default Server;
