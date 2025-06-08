"use client";
import { useState, useEffect } from "react";

interface Item {
  nome: string;
  valor: number;
  quantidade: number;
}

const LOCAL_STORAGE_KEY = "lista-compras-itens";

export default function Home() {
  const [itens, setItens] = useState<Item[]>([]);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const salvo = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (salvo) {
      try {
        setItens(JSON.parse(salvo));
      } catch {}
    }
  }, []);

  // Salvar no localStorage sempre que itens mudar
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(itens));
  }, [itens]);

  function capitalizeFirstLetter(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function handleItemChange(idx: number, field: keyof Item, value: string) {
    setItens((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]:
                field === "valor"
                  ? parseFloat(value)
                  : field === "quantidade"
                  ? parseInt(value)
                  : field === "nome"
                  ? capitalizeFirstLetter(value)
                  : value,
            }
          : item
      )
    );
  }

  function adicionarLinha() {
    setItens((prev) => [...prev, { nome: "", valor: 0, quantidade: 0 }]);
  }

  function formatarMoeda(valor: number | string) {
    const numero =
      typeof valor === "string"
        ? parseFloat(valor.replace(/\D/g, "")) / 100
        : valor;
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function desformatarMoeda(valor: string) {
    // Remove tudo que não for número
    const somenteNumeros = valor.replace(/\D/g, "");
    return parseFloat(somenteNumeros) / 100;
  }

  const total = itens.reduce(
    (acc, item) => acc + item.valor * item.quantidade,
    0
  );

  // Ordenar itens: valor > 0 primeiro
  const itensOrdenados = [...itens].sort((a, b) => {
    if (a.valor > 0 && b.valor === 0) return -1;
    if (a.valor === 0 && b.valor > 0) return 1;
    return 0;
  });

  const existeLinhaPadrao = itens.some(
    (item) => item.nome === "" && item.valor === 0 && item.quantidade === 0
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#18304b]">
      <div className="w-full max-w-md px-2 py-8 flex flex-col h-[90vh]">
        <header className="w-full sticky top-0 z-10 bg-[#18304b] pb-2">
          <div className="flex flex-col gap-2 items-start w-full">
            <span className="text-base font-semibold text-white w-full text-right">
              Total: {formatarMoeda(total)}
            </span>
            <h1 className="text-lg font-bold text-white">Lista de Compras</h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-separate border-spacing-0 text-sm mt-4">
            <thead>
              <tr className="bg-[#223c5c] text-[#b8c7e0]">
                <th className="px-2 py-2 font-medium text-left rounded-tl-md">
                  Nome
                </th>
                <th className="px-2 py-2 font-medium text-right">Valor</th>
                <th className="px-2 py-2 font-medium text-right rounded-tr-md">
                  Qtd.
                </th>
              </tr>
            </thead>
            <tbody>
              {itensOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-[#b8c7e0]">
                    Nenhum item adicionado
                  </td>
                </tr>
              ) : (
                itensOrdenados.map((item, idx) => {
                  const originalIdx = itens.findIndex((i) => i === item);
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-[#2e4a6f] last:border-b-0 ${
                        item.valor === 0 ? "bg-[#223c5c]" : ""
                      }`}
                    >
                      <td className="px-2 py-2 text-white">
                        <input
                          className="w-full bg-transparent text-white border-none outline-none placeholder:text-[#b8c7e0]"
                          value={item.nome}
                          onChange={(e) =>
                            handleItemChange(
                              originalIdx,
                              "nome",
                              e.target.value
                            )
                          }
                          placeholder="Nome"
                        />
                      </td>
                      <td className="px-2 py-2 text-right text-white">
                        <input
                          className="w-full bg-transparent text-right text-white border-none outline-none placeholder:text-[#b8c7e0]"
                          type="text"
                          inputMode="decimal"
                          value={formatarMoeda(item.valor)}
                          onChange={(e) => {
                            const valor = desformatarMoeda(e.target.value);
                            handleItemChange(
                              originalIdx,
                              "valor",
                              valor.toString()
                            );
                          }}
                          placeholder="Valor"
                          maxLength={15}
                        />
                      </td>
                      <td className="px-2 py-2 text-right text-white">
                        <input
                          className="w-full bg-transparent text-right text-white border-none outline-none placeholder:text-[#b8c7e0]"
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) =>
                            handleItemChange(
                              originalIdx,
                              "quantidade",
                              e.target.value
                            )
                          }
                          placeholder="Qtd."
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <footer className="sticky bottom-0 z-10 w-full flex flex-col items-center justify-end gap-4 pt-8 bg-[#18304b] pb-2">
          <button
            onClick={adicionarLinha}
            className="bg-[#223c5c] text-[#b8c7e0] px-4 py-2 rounded font-medium hover:bg-[#2e4a6f] transition w-full"
            disabled={existeLinhaPadrao}
            style={
              existeLinhaPadrao ? { opacity: 0.5, cursor: "not-allowed" } : {}
            }
          >
            Adicionar nova linha
          </button>
        </footer>
      </div>
    </div>
  );
}
