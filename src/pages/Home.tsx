import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Home = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ sistema: "", tipo: "", status: "" });

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const token = localStorage.getItem("tokenAuth");
        const res = await axios.get("http://localhost:3000/empresas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmpresas(res.data);
        setFiltered(res.data);
      } catch (err) {
        toast.error("Erro ao carregar empresas.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresas();
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    const result = empresas.filter((emp) =>
      emp.razao_social.toLowerCase().includes(s) ||
      emp.fantasia.toLowerCase().includes(s) ||
      emp.cnpj.includes(s)
    );
    setFiltered(result);
  }, [search, empresas]);

  const handleFilter = () => {
    const result = empresas.filter((emp) => {
      const sistemaMatch = filters.sistema
        ? emp.sistemas?.some((s) =>
            s.nome_sistema.toLowerCase().includes(filters.sistema.toLowerCase())
          )
        : true;

      const tipoMatch = filters.tipo
        ? emp.certificados?.some((c) =>
            c.tipo.toLowerCase().includes(filters.tipo.toLowerCase())
          )
        : true;

      const statusMatch = filters.status
        ? emp.certificados?.some((c) =>
            c.status.toLowerCase().includes(filters.status.toLowerCase())
          )
        : true;

      return sistemaMatch && tipoMatch && statusMatch;
    });

    setFiltered(result);
    setShowFilterModal(false);
  };

  // Contadores do dashboard
  const totalContatos = empresas.reduce((acc, emp) => acc + emp.contatos.length, 0);
  const totalAnydesk = empresas.reduce((acc, emp) => acc + emp.anydesk.length, 0);
  const totalServidores = empresas.reduce((acc, emp) => acc + emp.servidores.length, 0);
  const totalHelpdesk = empresas.reduce((acc, emp) => acc + emp.helpdesk.length, 0);
  const totalSistemas = empresas.reduce((acc, emp) => acc + emp.sistemas.length, 0);
  const totalCertificados = empresas.reduce((acc, emp) => acc + emp.certificados.length, 0);

  return (
    <div className="p-8 text-gray-800 dark:text-gray-100">
      {/* DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
        <DashboardCard label="Empresas" value={empresas.length} color="purple" />
        <DashboardCard label="Usuários" value={totalContatos} color="blue" />
        <DashboardCard label="Anydesk" value={totalAnydesk} color="pink" />
        <DashboardCard label="Servidores" value={totalServidores} color="green" />
        <DashboardCard label="Helpdesk" value={totalHelpdesk} color="yellow" />
        <DashboardCard label="Sistemas" value={totalSistemas} color="indigo" />
        <DashboardCard label="Certificados" value={totalCertificados} color="red" />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          className="px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 w-full sm:w-auto flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          onClick={() => setShowFilterModal(true)}
        >
          Filtros Avançados
        </button>
      </div>

      {/* LISTAGEM */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        filtered.map((empresa) => (
          <div
            key={empresa.id}
            className="mb-8 p-6 rounded-xl shadow-md bg-white dark:bg-gray-800"
          >
            <h2 className="text-xl font-semibold mb-2">{empresa.fantasia}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              CNPJ: {empresa.cnpj}
            </p>

            {/* DEMAIS BLOCOS */}
            {[
              { title: "Contatos", data: empresa.contatos, render: (c) => `${c.nome} (${c.cargo}) - ${c.celular}` },
              { title: "Anydesk", data: empresa.anydesk, render: (a) => `${a.codigo} - ${a.descricao} (senha: ${a.senha})` },
              { title: "Servidores", data: empresa.servidores, render: (s) => `${s.host} - ${s.user} (senha: ${s.senha})` },
              { title: "Helpdesk", data: empresa.helpdesk, render: (h) => `${h.email} (senha: ${h.senha})` },
              { title: "Sistemas", data: empresa.sistemas, render: (s) => `${s.nome_sistema} - v${s.versao} (${s.ativo ? "Ativo" : "Inativo"})` },
              { title: "Certificados", data: empresa.certificados, render: (c) => `${c.nome_certificado} - ${c.tipo} (${c.status} até ${new Date(c.data_validade).toLocaleDateString()})` },
            ].map((sec, i) => (
              <div key={i} className="mt-4">
                <h3 className="font-semibold">{sec.title}</h3>
                <ul className="list-disc ml-5">
                  {sec.data.map((d, i) => (
                    <li key={i}>{sec.render(d)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))
      )}

      {/* MODAL FILTRO */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Filtros Avançados</h2>

            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Sistema..."
                value={filters.sistema}
                onChange={(e) => setFilters({ ...filters, sistema: e.target.value })}
                className="border px-4 py-2 rounded-lg dark:bg-gray-900 dark:border-gray-600"
              />
              <input
                type="text"
                placeholder="Tipo certificado (ex: a1, a3)"
                value={filters.tipo}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                className="border px-4 py-2 rounded-lg dark:bg-gray-900 dark:border-gray-600"
              />
              <input
                type="text"
                placeholder="Status do certificado (ex: valid)"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="border px-4 py-2 rounded-lg dark:bg-gray-900 dark:border-gray-600"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancelar
              </button>
              <button
                onClick={handleFilter}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component dashboard (pode separar se quiser)
const DashboardCard = ({ label, value, color }) => {
  const colors = {
    purple: "bg-purple-600",
    blue: "bg-blue-600",
    pink: "bg-pink-600",
    green: "bg-green-600",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-600",
    red: "bg-red-600",
  };

  return (
    <div className="p-4 rounded-xl shadow-md bg-white dark:bg-gray-800 flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full ${colors[color]} flex items-center justify-center text-white font-bold`}>
        {value}
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{label}</p>
    </div>
  );
};

export default Home;
