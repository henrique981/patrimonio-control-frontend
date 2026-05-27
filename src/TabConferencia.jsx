import React, { useState, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';

const api = {
  async get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); },
  async put(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  async delete(path) { const r = await fetch(`${BASE}${path}`, { method: 'DELETE' }); return r.json(); }
};

const gerarRelatorioPDF = (itens, unidade, usuario) => {
  const agora = new Date().toLocaleString('pt-BR');
  const conferidos = itens.filter(i => i.data_conferencia);
  const pendentes = itens.filter(i => !i.data_conferencia);

  const renderLinha = (item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="font-family:monospace">${item.patrimonio}</td>
      <td>${item.nome_material}</td>
      <td>${item.n_serie || '--'}</td>
      <td>${item.responsavel_nome || '--'}</td>
      <td>${item.local_guarda || '--'}</td>
      <td style="color:${item.data_conferencia ? '#16a34a' : '#dc2626'};font-weight:700">
        ${item.data_conferencia ? 'CONFERIDO' : 'PENDENTE'}
      </td>
      <td>${item.data_conferencia ? new Date(item.data_conferencia).toLocaleDateString('pt-BR') : '--'}</td>
      <td>${item.conferido_por_re || '--'}</td>
    </tr>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Conferencia Patrimonial</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1a2035; padding: 24px; font-size: 11px; }
        .header { background: #003366; color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px; }
        .header h1 { font-size: 15px; font-weight: 700; }
        .header p { font-size: 11px; opacity: 0.8; margin-top: 3px; }
        .resumo { display: flex; gap: 20px; margin-bottom: 16px; }
        .card { background: #f3f4f6; border-radius: 6px; padding: 10px 14px; flex: 1; text-align: center; }
        .card .num { font-size: 22px; font-weight: 700; }
        .card .label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
        .secao { font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 4px; margin: 12px 0 8px; color: white; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #f3f4f6; padding: 5px 8px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
        td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; }
        .rodape { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Policia Militar do Estado de Sao Paulo — 5a CIA PM | 6o BPM/I</h1>
        <p>Conferencia Patrimonial — Unidade ${unidade || 'Todas'} — Gerado em ${agora}</p>
        <p>Responsavel: ${usuario?.nome || '--'} (RE: ${usuario?.re || '--'})</p>
      </div>
      <div class="resumo">
        <div class="card"><div class="num" style="color:#003366">${itens.length}</div><div class="label">Total de Itens</div></div>
        <div class="card"><div class="num" style="color:#16a34a">${conferidos.length}</div><div class="label">Conferidos</div></div>
        <div class="card"><div class="num" style="color:#dc2626">${pendentes.length}</div><div class="label">Pendentes</div></div>
        <div class="card"><div class="num" style="color:#2563eb">${itens.length > 0 ? Math.round(conferidos.length/itens.length*100) : 0}%</div><div class="label">Concluido</div></div>
      </div>

      ${conferidos.length > 0 ? `
        <div class="secao" style="background:#16a34a">Itens Conferidos (${conferidos.length})</div>
        <table>
          <thead><tr><th>#</th><th>Patrimonio</th><th>Material</th><th>N Serie</th><th>Responsavel</th><th>Local</th><th>Status</th><th>Data Conf.</th><th>RE Conf.</th></tr></thead>
          <tbody>${conferidos.map(renderLinha).join('')}</tbody>
        </table>
      ` : ''}

      ${pendentes.length > 0 ? `
        <div class="secao" style="background:#dc2626">Itens Pendentes (${pendentes.length})</div>
        <table>
          <thead><tr><th>#</th><th>Patrimonio</th><th>Material</th><th>N Serie</th><th>Responsavel</th><th>Local</th><th>Status</th><th>Data Conf.</th><th>RE Conf.</th></tr></thead>
          <tbody>${pendentes.map(renderLinha).join('')}</tbody>
        </table>
      ` : ''}

      <div class="rodape">5a CIA PM | 6o BPM/I — Conferencia Patrimonial — ${agora}</div>
    </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(html);
  janela.document.close();
  setTimeout(() => janela.print(), 500);
};

export default function TabConferencia({ showToast, usuario }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unidade, setUnidade] = useState('606065000');
  const [filtro, setFiltro] = useState('todos'); // todos | conferidos | pendentes
  const [selecionados, setSelecionados] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setSelecionados([]);
    try {
      const res = await api.get(`/patrimonio/conferencia?unidade_opm=${unidade}`);
      if (res.ok) setItens(res.dados);
      else showToast(res.erro || 'Erro ao carregar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setLoading(false);
  }, [unidade, showToast]);

  const conferirItem = async (patrimonio) => {
    try {
      const res = await api.put(`/patrimonio/conferencia/${patrimonio}`, {
        conferido_por_re: usuario?.re || '',
        conferido_por_nome: usuario?.nome || ''
      });
      if (res.ok) {
        setItens(its => its.map(i => i.patrimonio === patrimonio ? { ...i, data_conferencia: new Date().toISOString(), conferido_por_re: usuario?.re, conferido_por_nome: usuario?.nome } : i));
        showToast('Item conferido!', 'success');
      } else showToast(res.erro || 'Erro', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
  };

  const desconferirItem = async (patrimonio) => {
    try {
      const res = await api.delete(`/patrimonio/conferencia/${patrimonio}`);
      if (res.ok) {
        setItens(its => its.map(i => i.patrimonio === patrimonio ? { ...i, data_conferencia: null, conferido_por_re: null, conferido_por_nome: null } : i));
        showToast('Conferencia removida!', 'success');
      } else showToast(res.erro || 'Erro', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
  };

  const conferirLote = async () => {
    if (selecionados.length === 0) return showToast('Selecione pelo menos um item', 'error');
    setSalvando(true);
    try {
      const res = await api.put('/patrimonio/conferencia-lote', {
        patrimonios: selecionados,
        conferido_por_re: usuario?.re || '',
        conferido_por_nome: usuario?.nome || ''
      });
      if (res.ok) {
        showToast(res.mensagem, 'success');
        setSelecionados([]);
        carregar();
      } else showToast(res.erro || 'Erro', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSalvando(false);
  };

  const toggleSelecionado = (patrimonio) => {
    setSelecionados(s => s.includes(patrimonio) ? s.filter(p => p !== patrimonio) : [...s, patrimonio]);
  };

  const selecionarTodos = () => {
    const visiveis = itensFiltrados.filter(i => !i.data_conferencia).map(i => i.patrimonio);
    setSelecionados(visiveis);
  };

  const itensFiltrados = itens
    .filter(i => filtro === 'conferidos' ? i.data_conferencia : filtro === 'pendentes' ? !i.data_conferencia : true)
    .filter(i => !busca || i.nome_material?.toLowerCase().includes(busca.toLowerCase()) || i.patrimonio?.includes(busca));

  const conferidos = itens.filter(i => i.data_conferencia).length;
  const pendentes = itens.filter(i => !i.data_conferencia).length;
  const pct = itens.length > 0 ? Math.round(conferidos / itens.length * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase' }}>Unidade</label>
          <select value={unidade} onChange={e => setUnidade(e.target.value)}
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
            <option value="606065000">606065000</option>
            <option value="606065400">606065400</option>
          </select>
        </div>
        <button onClick={carregar} disabled={loading} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Carregando...' : 'Carregar Itens'}
        </button>
        {itens.length > 0 && (
          <button onClick={() => gerarRelatorioPDF(itens, unidade, usuario)} style={{ background: '#003366', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Gerar PDF
          </button>
        )}
      </div>

      {/* Cards de resumo */}
      {itens.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total', value: itens.length, color: 'var(--accent)' },
            { label: 'Conferidos', value: conferidos, color: 'var(--green)' },
            { label: 'Pendentes', value: pendentes, color: 'var(--red)' },
            { label: 'Concluido', value: `${pct}%`, color: pct === 100 ? 'var(--green)' : 'var(--yellow)' },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>{c.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Barra de progresso */}
      {itens.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>Progresso da Conferencia</span>
            <span style={{ color: 'var(--text2)' }}>{conferidos}/{itens.length}</span>
          </div>
          <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 5, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      {/* Tabela */}
      {itens.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '6px 10px', fontSize: 13, width: 200 }} />
            {['todos','conferidos','pendentes'].map(f => (
              <button key={f} onClick={() => setFiltro(f)} style={{
                background: filtro === f ? 'var(--accent)' : 'var(--border)',
                color: filtro === f ? '#fff' : 'var(--text2)',
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600
              }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
            <div style={{ flex: 1 }} />
            {selecionados.length > 0 && (
              <button onClick={conferirLote} disabled={salvando} style={{ background: 'var(--green)', color: '#fff', padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {salvando ? 'Conferindo...' : `Conferir ${selecionados.length} selecionados`}
              </button>
            )}
            {pendentes > 0 && (
              <button onClick={selecionarTodos} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Selecionar Pendentes
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                  <th style={{ padding: '10px 14px', width: 40 }}></th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>Patrimonio</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>Material</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>Responsavel</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>Local</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase' }}>Data Conf.</th>
                  <th style={{ padding: '10px 14px', width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map(item => (
                  <tr key={item.patrimonio} style={{ borderBottom: '1px solid var(--border)', background: item.data_conferencia ? '#10b98108' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = item.data_conferencia ? '#10b98108' : 'transparent'}>
                    <td style={{ padding: '8px 14px' }}>
                      {!item.data_conferencia && (
                        <input type="checkbox" checked={selecionados.includes(item.patrimonio)}
                          onChange={() => toggleSelecionado(item.patrimonio)} style={{ cursor: 'pointer' }} />
                      )}
                    </td>
                    <td style={{ padding: '8px 14px', fontFamily: 'monospace', color: 'var(--cyan)', fontSize: 12 }}>{item.patrimonio}</td>
                    <td style={{ padding: '8px 14px', fontWeight: 500 }}>{item.nome_material}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--text2)', fontSize: 12 }}>{item.responsavel_nome || '--'}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--text2)', fontSize: 12 }}>{item.local_guarda || '--'}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{
                        background: item.data_conferencia ? '#10b98120' : '#ef444420',
                        color: item.data_conferencia ? '#10b981' : '#ef4444',
                        border: `1px solid ${item.data_conferencia ? '#10b98140' : '#ef444440'}`,
                        borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600
                      }}>
                        {item.data_conferencia ? 'Conferido' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text2)' }}>
                      {item.data_conferencia ? new Date(item.data_conferencia).toLocaleDateString('pt-BR') : '--'}
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      {item.data_conferencia ? (
                        <button onClick={() => desconferirItem(item.patrimonio)} style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                          Desfazer
                        </button>
                      ) : (
                        <button onClick={() => conferirItem(item.patrimonio)} style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                          Conferir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {itensFiltrados.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Nenhum item encontrado</div>}
          </div>
        </div>
      )}
    </div>
  );
}
