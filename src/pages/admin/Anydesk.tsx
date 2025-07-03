import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, ArrowDownAZ, ArrowUpAZ, Edit, Trash } from "lucide-react";
import Modal from "../../components/Modal";

const Anydesk = () => {
  const [agrupados, setAgrupados] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [form, setForm] = useState({
    empresa_id: "",
    codigo: "",
    senha: "",
    link: "",
    descricao: "",
  });

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const [res, empRes] = await Promise.all([
        axios.get("http://localhost:3000/anydesk", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/empresas", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAgrupados(res.data);
      setEmpresas(empRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar registros.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditData(item);
      setForm({
        empresa_id: item.empresa_id,
        codigo: item.codigo,
        senha: item.senha,
        link: item.link,
        descricao: item.descricao,
      });
    } else {
      setEditData(null);
      setForm({ empresa_id: "", codigo: "", senha: "", link: "", descricao: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const payload = { ...form, empresa_id: Number(form.empresa_id) };
      if (editData) {
        await axios.put(`http://localhost:3000/anydesk/${editData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Registro atualizado!");
      } else {
        await axios.post("http://localhost:3000/anydesk", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Registro criado!");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar registro.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      const token = localStorage.getItem("tokenAuth");
      await axios.delete(`http://localhost:3000/anydesk/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Registro excluído!");
      fetchAll();
    } catch {
      toast.error("Erro ao excluir registro.");
    }
  };

  const filteredGroups = agrupados
    .filter((g) =>
      g.empresa.razao_social.toLowerCase().includes(search.toLowerCase()) ||
      g.anydesk.some((a) => a.descricao.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      sortAsc
        ? a.empresa.razao_social.localeCompare(b.empresa.razao_social)
        : b.empresa.razao_social.localeCompare(a.empresa.razao_social)
    );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Registros AnyDesk</h1>
        <p className="text-gray-600">Gerencie os acessos de suporte remoto vinculados às empresas.</p>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar por empresa ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {sortAsc ? <ArrowDownAZ size={18} /> : <ArrowUpAZ size={18} />}
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} className="inline mr-2" /> Novo Registro
          </button>
        </div>
      </div>

      {filteredGroups.map((grupo) => (
        <div key={grupo.empresa.id} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {grupo.empresa.razao_social} - CNPJ: {grupo.empresa.cnpj}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupo.anydesk.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow-md flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-blue-600 mb-1">{item.descricao}</h2>
                  <p className="text-sm mb-1">Código: {item.codigo}</p>
                  <p className="text-sm mb-1">Senha: {item.senha}</p>
                  <p className="text-sm mb-1">Link: <a href={item.link} className="text-blue-500 underline" target="_blank">Acessar</a></p>
                  <p className="text-xs text-gray-500">Criado em: {new Date(item.data_criacao).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openModal(item)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditData(item);
                      setModalDeleteOpen(true);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* MODAL FORM */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editData ? "Editar AnyDesk" : "Novo AnyDesk"}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Empresa *</label>
              <select
                value={form.empresa_id}
                onChange={(e) => setForm({ ...form, empresa_id: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.razao_social}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Código *</label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Senha *</label>
              <input
                type="text"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Link *</label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Descrição *</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
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

      {/* MODAL DELETE */}
      {modalDeleteOpen && editData && (
        <Modal
          isOpen={modalDeleteOpen}
          onClose={() => {
            setModalDeleteOpen(false);
            setEditData(null);
          }}
          title="Excluir Registro"
        >
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir o item abaixo?</p>
            <div className="p-4 border rounded bg-gray-100 dark:bg-gray-700">
              <p>
                <strong>Descrição:</strong> {editData.descricao}
              </p>
              <p>
                <strong>Empresa:</strong> {editData.empresa?.razao_social || "-"}
              </p>
            </div>
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

export default Anydesk;
