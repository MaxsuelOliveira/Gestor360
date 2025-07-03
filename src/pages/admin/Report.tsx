import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
// import { CSVLink } from "react-csv";
import { Search, Download } from "lucide-react";

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
  empresa: Empresa;
  codigo?: string | null;
}

interface Servidor {
  id: number;
  descricao: string;
  empresa: Empresa;
  // outras propriedades que desejar
}

interface Anydesk {
  id: number;
  codigo: string;
  senha: string;
  link: string;
  descricao: string;
  empresa: Empresa;
  data_criacao: string;
}

interface Helpdesk {
  id: number;
  email: string;
  senha: string;
  empresa: Empresa;
}

const ITEMS_PER_PAGE = 10;

const Report = () => {
  // Estados dos dados
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [anydesks, setAnydesks] = useState<Anydesk[]>([]);
  const [helpdesks, setHelpdesks] = useState<Helpdesk[]>([]);

  // Busca geral e paginação por tabela
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<{ [key: string]: number }>({
    contatos: 1,
    servidores: 1,
    anydesk: 1,
    helpdesk: 1,
  });

  // Fetch geral dos dados
  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("tokenAuth");
      const [empresasRes, contatosRes, servidoresRes, anydeskRes, helpdeskRes] = await Promise.all([
        axios.get("http://localhost:3000/empresas", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:3000/contatos", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:3000/servidores", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:3000/anydesk", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:3000/helpdesk", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setEmpresas(empresasRes.data);
      setContatos(contatosRes.data);
      setServidores(servidoresRes.data);
      setAnydesks(anydeskRes.data);
      setHelpdesks(helpdeskRes.data);
    } catch (err) {
      toast.error("Erro ao carregar dados do relatório");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Função para filtragem geral simples (busca em vários campos)
  const filterBySearch = <T,>(list: T[], fields: (keyof T)[]) => {
    if (!search.trim()) return list;
    const lowerSearch = search.toLowerCase();
    return list.filter((item) =>
      fields.some((field) => {
        const value = item[field];
        if (!value) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  };

  // Paginação simples
  const paginate = <T,>(list: T[], pageNum: number) => {
    const start = (pageNum - 1) * ITEMS_PER_PAGE;
    return list.slice(start, start + ITEMS_PER_PAGE);
  };

  // Dados filtrados e paginados
  const contatosFiltered = filterBySearch(contatos, ["nome", "cargo", "celular"]);
  const contatosPage = paginate(contatosFiltered, page.contatos);

  const servidoresFiltered = filterBySearch(servidores, ["descricao"]);
  const servidoresPage = paginate(servidoresFiltered, page.servidores);

  const anydeskFiltered = filterBySearch(anydesks, ["codigo", "descricao"]);
  const anydeskPage = paginate(anydeskFiltered, page.anydesk);

  const helpdeskFiltered = filterBySearch(helpdesks, ["email"]);
  const helpdeskPage = paginate(helpdeskFiltered, page.helpdesk);

  // Total geral (exemplo de resumo)
  const totalEmpresas = empresas.length;
  const totalContatos = contatos.length;
  const totalServidores = servidores.length;
  const totalAnydesk = anydesks.length;
  const totalHelpdesk = helpdesks.length;

  // CSV headers
  const csvHeadersContatos = [
    { label: "Nome", key: "nome" },
    { label: "Celular", key: "celular" },
    { label: "Cargo", key: "cargo" },
    { label: "Código", key: "codigo" },
    { label: "Empresa", key: "empresa.razao_social" },
  ];

  // Para exportar CSV (exemplo Contatos)
  const csvDataContatos = contatos.map((c) => ({
    nome: c.nome,
    celular: c.celular,
    cargo: c.cargo,
    codigo: c.codigo || "",
    "empresa.razao_social": c.empresa.razao_social,
  }));

  // Função para alterar página
  const changePage = (table: string, delta: number) => {
    setPage((p) => {
      const newPage = Math.max(1, (p[table] || 1) + delta);
      return { ...p, [table]: newPage };
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Relatório Geral do Sistema</h1>

      {/* Resumo */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
        <div className="bg-blue-600 text-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Empresas</h2>
          <p className="text-3xl">{totalEmpresas}</p>
        </div>
        <div className="bg-green-600 text-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Contatos</h2>
          <p className="text-3xl">{totalContatos}</p>
        </div>
        <div className="bg-purple-600 text-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Servidores</h2>
          <p className="text-3xl">{totalServidores}</p>
        </div>
        <div className="bg-yellow-600 text-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Anydesk</h2>
          <p className="text-3xl">{totalAnydesk}</p>
        </div>
        <div className="bg-red-600 text-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Helpdesk</h2>
          <p className="text-3xl">{totalHelpdesk}</p>
        </div>
      </section>

      {/* Busca geral */}
      <div className="flex items-center gap-2 mb-8 max-w-sm">
        <Search size={20} className="text-gray-500 dark:text-gray-300" />
        <input
          type="text"
          placeholder="Buscar em todos os dados..."
          className="p-2 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // Reset all pages para 1
            setPage({ contatos: 1, servidores: 1, anydesk: 1, helpdesk: 1 });
          }}
        />
      </div>

      {/* Tabelas */}

      {/* Contatos */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white flex justify-between items-center">
          Contatos
          {/* <CSVLink
            data={csvDataContatos}
            headers={csvHeadersContatos}
            filename={"contatos_relatorio.csv"}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            <Download size={16} /> Exportar CSV
          </CSVLink> */}
        </h2>
        <div className="overflow-x-auto rounded shadow">
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Nome</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Celular</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Cargo</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Código</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Empresa</th>
              </tr>
            </thead>
            <tbody>
              {contatosPage.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              ) : (
                contatosPage.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{c.nome}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{c.celular}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{c.cargo}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{c.codigo || "-"}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{c.empresa.razao_social}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginação */}
        {Math.ceil(contatosFiltered.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center mt-3 gap-2">
            <button
              disabled={page.contatos === 1}
              onClick={() => changePage("contatos", -1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">{page.contatos}</span>
            <button
              disabled={page.contatos === Math.ceil(contatosFiltered.length / ITEMS_PER_PAGE)}
              onClick={() => changePage("contatos", 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        )}
      </section>

      {/* Servidores */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Servidores</h2>
        <div className="overflow-x-auto rounded shadow">
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Descrição</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Empresa</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">CNPJ</th>
              </tr>
            </thead>
            <tbody>
              {servidoresPage.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Nenhum servidor encontrado.
                  </td>
                </tr>
              ) : (
                servidoresPage.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{s.descricao}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{s.empresa.razao_social}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{s.empresa.cnpj}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginação */}
        {Math.ceil(servidoresFiltered.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center mt-3 gap-2">
            <button
              disabled={page.servidores === 1}
              onClick={() => changePage("servidores", -1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">{page.servidores}</span>
            <button
              disabled={page.servidores === Math.ceil(servidoresFiltered.length / ITEMS_PER_PAGE)}
              onClick={() => changePage("servidores", 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        )}
      </section>

      {/* Anydesk */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Anydesk</h2>
        <div className="overflow-x-auto rounded shadow">
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Código</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Senha</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Descrição</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Link</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Empresa</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Data Criação</th>
              </tr>
            </thead>
            <tbody>
              {anydeskPage.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Nenhum anydesk encontrado.
                  </td>
                </tr>
              ) : (
                anydeskPage.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{a.codigo}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{a.senha}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{a.descricao}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">
                      <a href={a.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Link
                      </a>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{a.empresa.razao_social}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">
                      {new Date(a.data_criacao).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginação */}
        {Math.ceil(anydeskFiltered.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center mt-3 gap-2">
            <button
              disabled={page.anydesk === 1}
              onClick={() => changePage("anydesk", -1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">{page.anydesk}</span>
            <button
              disabled={page.anydesk === Math.ceil(anydeskFiltered.length / ITEMS_PER_PAGE)}
              onClick={() => changePage("anydesk", 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        )}
      </section>

      {/* Helpdesk */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Helpdesk</h2>
        <div className="overflow-x-auto rounded shadow">
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Email</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Senha</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Empresa</th>
              </tr>
            </thead>
            <tbody>
              {helpdeskPage.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Nenhum helpdesk encontrado.
                  </td>
                </tr>
              ) : (
                helpdeskPage.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{h.email}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{h.senha}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{h.empresa.razao_social}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginação */}
        {Math.ceil(helpdeskFiltered.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center mt-3 gap-2">
            <button
              disabled={page.helpdesk === 1}
              onClick={() => changePage("helpdesk", -1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">{page.helpdesk}</span>
            <button
              disabled={page.helpdesk === Math.ceil(helpdeskFiltered.length / ITEMS_PER_PAGE)}
              onClick={() => changePage("helpdesk", 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Report;