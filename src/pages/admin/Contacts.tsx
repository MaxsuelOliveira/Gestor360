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

interface Contato {
  id: number;
  nome: string;
  celular: string;
  cargo: string;
  codigo?: string | null;
}

interface GrupoContatos {
  empresa: Empresa;
  contatos: Contato[];
}

const ITEMS_PER_PAGE = 10;

const Contatcs = () => {
  const [grupos, setGrupos] = useState<GrupoContatos[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [editData, setEditData] = useState<(Contato & { empresa: Empresa }) | null>(null);
  const [form, setForm] = useState({
    nome: "",
    celular: "",
    cargo: "",
    empresa_id: "",
    codigo: "",
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch contatos agrupados e empresas para select
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const [contatosRes, empresasRes] = await Promise.all([
        axios.get("http://localhost:3000/contatos", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/empresas", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setGrupos(contatosRes.data);
      setEmpresas(empresasRes.data);
    } catch {
      toast.error("Erro ao carregar dados.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (contato?: Contato & { empresa: Empresa }) => {
    if (contato) {
      setEditData(contato);
      setForm({
        nome: contato.nome,
        celular: contato.celular,
        cargo: contato.cargo,
        empresa_id: String(contato.empresa.id),
        codigo: contato.codigo || "",
      });
    } else {
      setEditData(null);
      setForm({ nome: "", celular: "", cargo: "", empresa_id: "", codigo: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const payload = {
        nome: form.nome,
        celular: form.celular,
        cargo: form.cargo,
        codigo: form.codigo,
        empresa_id: Number(form.empresa_id),
      };
      if (editData) {
        await axios.put(`http://localhost:3000/contatos/${editData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Contato atualizado.");
      } else {
        await axios.post("http://localhost:3000/contatos", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Contato criado.");
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error("Erro ao salvar contato.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      const token = localStorage.getItem("tokenAuth");
      await axios.delete(`http://localhost:3000/contatos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Contato excluído.");
      fetchData();
    } catch {
      toast.error("Erro ao excluir contato.");
    }
  };

  // Filtrar e ordenar
  const filtered = grupos
    .map((grupo) => ({
      empresa: grupo.empresa,
      contatos: grupo.contatos.filter(
        (c) =>
          c.nome.toLowerCase().includes(search.toLowerCase()) ||
          grupo.empresa.razao_social.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.contatos.length > 0)
    .sort((a, b) =>
      sortAsc
        ? a.empresa.razao_social.localeCompare(b.empresa.razao_social)
        : b.empresa.razao_social.localeCompare(a.empresa.razao_social)
    );

  // Paginação (paginar o array de grupos, não os contatos individualmente)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedGroups = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contatos por Empresa</h1>
        <p className="text-gray-600">Gerencie os contatos agrupados por empresa.</p>
      </div>

      <div className="flex justify-between mb-4 flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou empresa..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded w-full max-w-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />

        <div className="flex gap-3">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3 py-2 border rounded text-gray-700 dark:text-gray-200 dark:border-gray-600"
            aria-label="Alternar ordem"
          >
            {sortAsc ? <ArrowDownAZ size={18} /> : <ArrowUpAZ size={18} />}
          </button>

          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} className="inline mr-2" /> Novo Contato
          </button>
        </div>
      </div>

      {paginatedGroups.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-300 mt-10">Nenhum contato encontrado.</p>
      )}

      {paginatedGroups.map(({ empresa, contatos }) => (
        <div key={empresa.id} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {empresa.razao_social}{" "}
            <span className="text-sm text-gray-500">- CNPJ: {empresa.cnpj}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contatos.map((contato) => (
              <div
                key={contato.id}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-blue-600">{contato.nome}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Cargo: {contato.cargo}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Celular: {contato.celular}</p>
                  {contato.codigo && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">Código: {contato.codigo}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => openModal({ ...contato, empresa })}
                    className="text-yellow-500 hover:text-yellow-600"
                    aria-label="Editar contato"
                    type="button"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditData({ ...contato, empresa });
                      setModalDeleteOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                    aria-label="Excluir contato"
                    type="button"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Anterior
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      )}

      {/* MODAL CADASTRO/EDIÇÃO */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editData ? "Editar Contato" : "Novo Contato"}
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
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="text"
              value={form.celular}
              onChange={(e) => setForm({ ...form, celular: e.target.value })}
              placeholder="Celular"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="text"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              placeholder="Cargo"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="text"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="Código (opcional)"
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

      {/* MODAL EXCLUSÃO */}
      {modalDeleteOpen && editData && (
        <Modal
          isOpen={modalDeleteOpen}
          onClose={() => {
            setModalDeleteOpen(false);
            setEditData(null);
          }}
          title="Excluir Contato"
        >
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir o contato abaixo?</p>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p>
                <strong>Nome:</strong> {editData.nome}
              </p>
              <p>
                <strong>Empresa:</strong> {editData.empresa.razao_social}
              </p>
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

export default Contatcs;
