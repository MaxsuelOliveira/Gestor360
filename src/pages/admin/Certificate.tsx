import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, ArrowDownAZ, ArrowUpAZ, Edit, Trash } from "lucide-react";
import Modal from "../../components/Modal";

const Certificate = () => {
  const [certificados, setCertificados] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [form, setForm] = useState({
    empresa_id: "",
    nome_certificado: "",
    data_validade: "",
    tipo: "A1",
  });

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const [certRes, empRes] = await Promise.all([
        axios.get("http://localhost:3000/certificados", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/empresas", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCertificados(certRes.data);
      setEmpresas(empRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar certificados ou empresas.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openModal = (cert = null) => {
    if (cert) {
      setEditData(cert);
      setForm({
        empresa_id: cert.empresa_id,
        nome_certificado: cert.nome_certificado,
        data_validade: cert.data_validade.split("T")[0],
        tipo: cert.tipo.toUpperCase(),
      });
    } else {
      setEditData(null);
      setForm({ empresa_id: "", nome_certificado: "", data_validade: "", tipo: "A1" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const payload = {
        ...form,
        empresa_id: Number(form.empresa_id),
        data_validade: form.data_validade,
        tipo: form.tipo.toUpperCase(),
      };
      if (editData) {
        await axios.put(`http://localhost:3000/certificados/${editData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Certificado atualizado!");
      } else {
        await axios.post("http://localhost:3000/certificados", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Certificado criado!");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error("Erro ao salvar certificado:", err);
      toast.error("Erro ao salvar certificado.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      const token = localStorage.getItem("tokenAuth");
      await axios.delete(`http://localhost:3000/certificados/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Certificado excluído!");
      fetchAll();
    } catch {
      toast.error("Erro ao excluir certificado.");
    }
  };

  const filteredGroups = certificados
    .map((grupo) => ({
      ...grupo,
      certificados: grupo.certificados.filter((c) =>
        c.nome_certificado.toLowerCase().includes(search.toLowerCase()) ||
        grupo.empresa.razao_social.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((grupo) => grupo.certificados.length > 0);

  const sortedGroups = filteredGroups.sort((a, b) =>
    sortAsc
      ? a.empresa.razao_social.localeCompare(b.empresa.razao_social)
      : b.empresa.razao_social.localeCompare(a.empresa.razao_social)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Certificados Digitais</h1>
        <p className="text-gray-600">
          Gerencie certificados digitais de suas empresas. Crie, edite ou exclua certificados conforme necessário.
        </p>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou empresa..."
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
            <Plus size={18} className="inline mr-2" /> Novo Certificado
          </button>
        </div>
      </div>

      {sortedGroups.map((grupo) => (
        <div key={grupo.empresa.cnpj} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {grupo.empresa.razao_social} - CNPJ: {grupo.empresa.cnpj}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grupo.certificados.map((cert) => (
              <div
                key={cert.id}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow-md flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-blue-600 mb-1">
                    {cert.nome_certificado}
                  </h2>
                  <p className="text-sm mb-1">Tipo: {cert.tipo.toUpperCase()}</p>
                  <p className="text-sm mb-1">
                    Validade: {new Date(cert.data_validade).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(cert.data_criacao).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openModal(cert)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditData(cert);
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

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editData ? "Editar Certificado" : "Novo Certificado"}
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
                  <option key={e.id} value={e.id}>
                    {e.razao_social}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nome do Certificado *</label>
              <input
                type="text"
                value={form.nome_certificado}
                onChange={(e) => setForm({ ...form, nome_certificado: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Data de Validade *</label>
              <input
                type="date"
                value={form.data_validade}
                onChange={(e) => setForm({ ...form, data_validade: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="A1">A1</option>
                <option value="A3">A3</option>
              </select>
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
          onClose={() => {
            setModalDeleteOpen(false);
            setEditData(null);
          }}
          title="Excluir Certificado"
        >
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir o certificado abaixo?</p>
            <div className="p-4 border rounded bg-gray-100 dark:bg-gray-700">
              <p>
                <strong>Nome:</strong> {editData.nome_certificado}
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

export default Certificate;