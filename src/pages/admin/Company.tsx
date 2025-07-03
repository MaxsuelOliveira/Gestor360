import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateModal from "../../components/modals/CreateModal";
import EditModal from "../../components/modals/EditModal";
import DeleteModal from "../../components/modals/DeleteModal";

const Empresas = () => {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any | null>(null);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    const res = await axios.get("http://localhost:3000/empresas");
    setEmpresas(res.data);
  };

  const handleCreate = async (data: any) => {
    await axios.post("http://localhost:3000/empresas", data);
    setShowCreate(false);
    fetchEmpresas();
  };

  const handleEdit = async (data: any) => {
    await axios.put(
      `http://localhost:3000/empresas/${selectedEmpresa.id}`,
      data
    );
    setShowEdit(false);
    fetchEmpresas();
  };

  const handleDelete = async () => {
    await axios.delete(
      `http://localhost:3000/empresas/${selectedEmpresa.id}`
    );
    setShowDelete(false);
    fetchEmpresas();
  };

  const filtered = empresas.filter((e) =>
    e.razao_social.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-gray-600">
          Aqui você pode gerenciar as empresas, incluindo criação, edição e
          exclusão.
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar empresa..."
          className="border px-4 py-2 rounded w-1/2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowCreate(true)}
        >
          + Nova Empresa
        </button>
      </div>

      <table className="w-full text-left border dark:border-gray-700 dark:bg-gray-900">
        <thead className="dark:bg-gray-800 dark:text-gray-200  dark:border-gray-700">
          <tr className="">
            <th className="p-2">Razão Social</th>
            <th className="p-2">CNPJ</th>
            <th className="p-2">Ativa</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((empresa) => (
            <tr key={empresa.id} className="border-t dark:border-gray-700">
              <td className="p-2">{empresa.razao_social}</td>
              <td className="p-2">{empresa.cnpj}</td>
              <td className="p-2">{empresa.ativa ? "Sim" : "Não"}</td>
              <td className="p-2 space-x-2">
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => {
                    setSelectedEmpresa(empresa);
                    setShowEdit(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => {
                    setSelectedEmpresa(empresa);
                    setShowDelete(true);
                  }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modais */}
      <CreateModal
        isOpen={showCreate}
        title="Criar Nova Empresa"
        fields={[
          { name: "razao_social", label: "Razão Social" },
          { name: "fantasia", label: "Nome Fantasia" },
          { name: "cnpj", label: "CNPJ" },
        ]}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
      />

      {selectedEmpresa && (
        <EditModal
          isOpen={showEdit}
          title="Editar Empresa"
          data={selectedEmpresa}
          fields={[
            { name: "razao_social", label: "Razão Social" },
            { name: "fantasia", label: "Nome Fantasia" },
            { name: "cnpj", label: "CNPJ" },
          ]}
          onClose={() => setShowEdit(false)}
          onSave={handleEdit}
        />
      )}

      {selectedEmpresa && (
        <DeleteModal
          isOpen={showDelete}
          title="Excluir Empresa"
          message={`Tem certeza que deseja excluir a empresa "${selectedEmpresa.razao_social}"?`}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default Empresas;
