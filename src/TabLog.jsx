import React, { useState, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';

const api = {
  async get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); }
};

const TABELAS = [
  { value: '', label: 'Todas' },
  { value: 'itens_patrimoniais', label: 'Itens Patrimoniais' },
  { value: 'armas', label: 'Armamento' },
  { value: 'viaturas', label: 'Viaturas' },
];

const gerarRelatorioPDF = (logs, filtros) => {
  const agora = new Date().toLocaleString('pt-BR');

  const linhas = logs.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="white-space:nowrap">${new Date(l.data_alteracao).toLocaleString('pt-BR')}</td>
      <td>${l.usuario_re || '--'}</td>
      <td>${l.usuario_nome || '--'}</td>
      <td>${{ itens_patrimoniais: 'Itens', armas: 'Armamento', viaturas: 'Viaturas' }[l.tabela] || l.tabela}</td>
      <td><strong>${l.registro_id}</strong>${l.registro_desc ? `<br><small style="color:#6b7280">${l.registro_desc}</small>` : ''}</td>
      <td>${l.campo || '--'}</td>
      <td style="color:#ef4444">${l.valor_anterior || '--'}</td>
      <td style="color:#10b981">${l.valor_novo || '--'}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Log de Alteracoes</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1a2035; padding: 24px; font-size: 12px; }
        .header { background: #003366; color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { font-size: 16px; font-weight: 700; }
        .header p { font-size: 11px; opacity: 0.8; margin-top: 4px; }
        .meta { font-size: 11px; color: #6b7280; margin-bottom: 16px; display: flex; gap: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f3f4f6; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
        td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
        tr:nth-child(even) td { background: #fafafa; }
        .rodape { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Policia Militar do Estado de Sao Paulo — 5a CIA PM | 6o BPM/I</h1>
        <p>Relatorio de Log de Alteracoes</p>
      </div>
      <div class="meta">
        <span>Gerado em: ${agora}</span>
        <span>Total de registros: ${logs.length}</span>
        ${filtros.tabela ? `<span>Modulo: ${{ itens_patrimoniais: 'Itens', armas: 'Armamento', viaturas: 'Viaturas' }[filtros.tabela]}</span>` : ''}
        ${filtros.data_inicio ? `<span>Periodo: ${filtros.data_inicio} ate ${filtros.data_fim || 'hoje'}</span>` : ''}
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Data/Hora</th>
            <th>RE</th>
            <th>Usuario</th>
            <th>Modulo</th>
            <th>Registro</th>
            <th>Campo</th>
            <th>Valor Anterior</th>
            <th>Valor Novo</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
      <div class="rodape">5a CIA PM | 6o BPM/I — Relatorio gerado em ${agora}</div>
    </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(html);
  janela.document.close();
  setTimeout(() => janela.print(), 500);
};

export default function TabLog({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ tabela: '', data_inicio: '', data_fim: '', usuario_re: '' });

  const buscar = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/log?';
      if (filtros.tabela)      url += `tabela=${filtros.tabela}&`;
      if (filtros.usuario_re)  url += `usuario_re=${filtros.usuario_re}&`;
      if (filtros.data_inicio) url += `data_inicio=${filtros.data_inicio}&`;
      if (filtros.data_fim)    url += `data_fim=${filtros.data_fim}&`;
      const res = await api.get(url);
      if (res.ok) setLogs(res.logs);
      else showToast(res.erro || 'Erro ao buscar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setLoading(false);
  }, [filtros, showToast]);

  const handleFiltro = e => setFiltros(f => ({ ...f, [e.target.name]: e.target.value }));

  const inputStyle = { background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13 };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filtros */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Modulo</label>
            <select name="tabela" value={filtros.tabela} onChange={handleFiltro} style={{ ...inputStyle, width: '100%' }}>
              {TABELAS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>RE do Usuario</label>
            <input name="usuario_re" value={filtros.usuario_re} onChange={handleFiltro} placeholder="RE..." style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Data Inicio</label>
            <input type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleFiltro} style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Data Fim</label>
            <input type="date" name="data_fim" value={filtros.data_fim} onChange={handleFiltro} style={{ ...inputStyle, width: '100%' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={buscar} disabled={loading} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          {logs.length > 0 && (
            <button onClick={() => gerarRelatorioPDF(logs, filtros)} style={{ background: '#003366', color: '#fff', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Gerar PDF
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      {logs.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Log de Alteracoes</span>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{logs.length} registros</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                  {['Data/Hora','RE','Usuario','Modulo','Registro','Campo','Anterior','Novo'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '8px 12px', color: 'var(--text2)', whiteSpace: 'nowrap', fontSize: 11 }}>
                      {new Date(l.data_alteracao).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--cyan)', fontSize: 11 }}>{l.usuario_re || '--'}</td>
                    <td style={{ padding: '8px 12px', fontSize: 11 }}>{l.usuario_nome || '--'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: 'var(--bg3)', color: 'var(--text2)', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                        {{ itens_patrimoniais: 'Itens', armas: 'Armas', viaturas: 'Viaturas' }[l.tabela] || l.tabela}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: 11 }}>{l.registro_id}</div>
                      {l.registro_desc && <div style={{ color: 'var(--text3)', fontSize: 10 }}>{l.registro_desc}</div>}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, fontSize: 11 }}>{l.campo || '--'}</td>
                    <td style={{ padding: '8px 12px', color: '#ef4444', fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.valor_anterior || '--'}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#10b981', fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.valor_novo || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>
          Use os filtros acima e clique em Buscar para ver o log de alteracoes
        </div>
      )}
    </div>
  );
}
