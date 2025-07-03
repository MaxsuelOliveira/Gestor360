import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Edit, Trash, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import Modal from "../../components/Modal";

interface Helpdesk {
  id: number;
  email: string;
  senha: string;
}

interface EmpresaHelpdeskGroup {
  empresa: {
    id: number;
    razao_social: string;
    cnpj: string;
  };
  helpdesks: Helpdesk[];
}

const Helpdesk = () => {
  const [grupos, setGrupos] = useState<EmpresaHelpdeskGroup[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [editData, setEditData] = useState<(Helpdesk & { empresa: EmpresaHelpdeskGroup["empresa"] }) | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [form, setForm] = useState({ email: "", senha: "", empresa_id: "" });
  const [empresas, setEmpresas] = useState<{ id: number; razao_social: string }[]>([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const [helpdeskRes, empresasRes] = await Promise.all([
        axios.get("http://localhost:3000/helpdesk", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/empresas", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setGrupos(helpdeskRes.data);
      setEmpresas(empresasRes.data);
    } catch {
      toast.error("Erro ao carregar dados.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item?: Helpdesk & { empresa: EmpresaHelpdeskGroup["empresa"] }) => {
    if (item) {
      setEditData(item);
      setForm({ email: item.email, senha: item.senha, empresa_id: String(item.empresa.id) });
    } else {
      setEditData(null);
      setForm({ email: "", senha: "", empresa_id: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const payload = { ...form, empresa_id: Number(form.empresa_id) };
      if (editData) {
        await axios.put(`http://localhost:3000/helpdesk/${editData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Registro atualizado.");
      } else {
        await axios.post("http://localhost:3000/helpdesk", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Registro criado.");
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro ao salvar registro.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      const token = localStorage.getItem("tokenAuth");
      await axios.delete(`http://localhost:3000/helpdesk/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Registro excluído.");
      fetchData();
    } catch {
      toast.error("Erro ao excluir.");
    }
  };

  const filtered = grupos
    .filter((g) =>
      g.empresa.razao_social.toLowerCase().includes(search.toLowerCase()) ||
      g.helpdesks.some((h) => h.email.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      sortAsc
        ? a.empresa.razao_social.localeCompare(b.empresa.razao_social)
        : b.empresa.razao_social.localeCompare(a.empresa.razao_social)
    );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Helpdesk</h1>
        <p className="text-gray-600">Gerencie os acessos ao Helpdesk por empresa.</p>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar por email ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
        <div className="flex gap-3">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3 py-2 border rounded text-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            {sortAsc ? <ArrowDownAZ size={18} /> : <ArrowUpAZ size={18} />}
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} className="inline mr-2" /> Novo Acesso
          </button>
        </div>
      </div>

      {filtered.map((grupo) => (
        <div key={grupo.empresa.id} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {grupo.empresa.razao_social} - CNPJ: {grupo.empresa.cnpj}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupo.helpdesks.map((h) => (
              <div
                key={h.id}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm">Email: {h.email}</p>
                  <p className="text-sm">Senha: {h.senha}</p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openModal({ ...h, empresa: grupo.empresa })}
                    className="text-yellow-600 hover:underline"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditData({ ...h, empresa: grupo.empresa });
                      setModalDeleteOpen(true);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    <Trash size={18} />
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
          onClose={() => setModalOpen(false)}
          title={editData ? "Editar Acesso" : "Novo Acesso"}
        >
          <div className="space-y-4">
            <select
              value={form.empresa_id}
              onChange={(e) => setForm({ ...form, empresa_id: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Selecione a empresa</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.razao_social}
                </option>
              ))}
            </select>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="text"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder="Senha"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <div className="text-right">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          onClose={() => {
            setModalDeleteOpen(false);
            setEditData(null);
          }}
          title="Excluir Acesso"
        >
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir o acesso para:</p>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p><strong>Email:</strong> {editData.email}</p>
              <p><strong>Empresa:</strong> {editData.empresa.razao_social}</p>
            </div>
            <div className="text-right space-x-2">
              <button
                onClick={() => {
                  setModalDeleteOpen(false);
                  setEditData(null);
                }}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
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

export default Helpdesk;
