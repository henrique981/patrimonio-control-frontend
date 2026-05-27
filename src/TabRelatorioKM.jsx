import React, { useState, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';
const api = { async get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); } };

const gerarPDF = (dados, filtros) => {
  const agora = new Date().toLocaleString('pt-BR');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatorio KM</title>
  <style>* { margin:0;padding:0;box-sizing:border-box; } body { font-family:Arial,sans-serif;color:#1a2035;padding:24px;font-size:11px; }
  .header { background:#003366;color:white;padding:16px 20px;border-radius:8px;margin-bottom:16px; }
  .header h1 { font-size:15px;font-weight:700; } .header p { font-size:11px;opacity:0.8;margin-top:3px; }
  .cards { display:flex;gap:12px;margin-bottom:16px; } .card { background:#f3f4f6;border-radius:6px;padding:10px 14px;flex:1;text-align:center; }
  .card .num { font-size:20px;font-weight:700;color:#003366; } .card .label { font-size:9px;color:#6b7280;text-transform:uppercase;margin-top:2px; }
  h2 { font-size:12px;font-weight:700;color:#003366;margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid #003366; }
  table { width:100%;border-collapse:collapse;font-size:10px;margin-bottom:16px; }
  th { background:#f3f4f6;padding:5px 8px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb; }
  td { padding:5px 8px;border-bottom:1px solid #f3f4f6; } tr:nth-child(even) td { background:#fafafa; }
  .rodape { margin-top:16px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:9px;color:#9ca3af;text-align:center; }
  @media print { body { padding:10px; } }</style></head><body>
  <div class="header"><h1>Policia Militar do Estado de Sao Paulo — 5a CIA PM | 6o BPM/I</h1>
  <p>Relatorio de Quilometragem — Periodo: ${filtros.data_inicio || 'Inicio'} a ${filtros.data_fim || 'Hoje'}</p>
  <p>Gerado em: ${agora}</p></div>
  <div class="cards">
    <div class="card"><div class="num">${dados.resumo.total_viaturas}</div><div class="label">Viaturas</div></div>
    <div class="card"><div class="num">${Number(dados.resumo.km_total_frota).toLocaleString('pt-BR')}</div><div class="label">KM Total Frota</div></div>
    <div class="card"><div class="num">${Number(dados.resumo.km_media).toLocaleString('pt-BR')}</div><div class="label">Media por Viatura</div></div>
    <div class="card"><div class="num">${dados.resumo.total_saidas}</div><div class="label">Total Saidas</div></div>
  </div>
  <h2>KM por Viatura</h2>
  <table><thead><tr><th>#</th><th>Prefixo</th><th>Veiculo</th><th>Placa</th><th>KM Inicial</th><th>KM Final</th><th>KM Rodado</th><th>Saidas</th></tr></thead>
  <tbody>${dados.por_viatura.map((v,i) => `<tr><td>${i+1}</td><td><strong>${v.prefixo}</strong></td><td>${v.marca} ${v.modelo}</td><td>${v.placa||'--'}</td><td>${Number(v.km_inicial).toLocaleString('pt-BR')}</td><td>${Number(v.km_final).toLocaleString('pt-BR')}</td><td style="font-weight:700;color:#003366">${Number(v.km_rodado).toLocaleString('pt-BR')}</td><td>${v.total_saidas}</td></tr>`).join('')}</tbody></table>
  <h2>KM por Policial</h2>
  <table><thead><tr><th>#</th><th>RE</th><th>Nome</th><th>Saidas</th><th>KM Total</th></tr></thead>
  <tbody>${dados.por_policial.map((p,i) => `<tr><td>${i+1}</td><td>${p.policial_re}</td><td>${p.policial_nome||'--'}</td><td>${p.total_saidas}</td><td style="font-weight:700">${Number(p.km_total).toLocaleString('pt-BR')}</td></tr>`).join('')}</tbody></table>
  <div class="rodape">5a CIA PM | 6o BPM/I — Relatorio de KM — ${agora}</div>
  </body></html>`;
  const janela = window.open('', '_blank');
  janela.document.write(html);
  janela.document.close();
  setTimeout(() => janela.print(), 500);
};

export default function TabRelatorioKM({ showToast }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '' });

  const buscar = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/assuncao/relatorio/km?';
      if (filtros.data_inicio) url += `data_inicio=${filtros.data_inicio}&`;
      if (filtros.data_fim)    url += `data_fim=${filtros.data_fim}&`;
      const res = await api.get(url);
      if (res.ok) setDados(res);
      else showToast(res.erro || 'Erro ao buscar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setLoading(false);
  }, [filtros, showToast]);

  const inputStyle = { background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '8px 12px', fontSize: 13 };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div><label style={labelStyle}>Data Inicio</label><input type="date" value={filtros.data_inicio} onChange={e => setFiltros(f => ({ ...f, data_inicio: e.target.value }))} style={inputStyle} /></div>
          <div><label style={labelStyle}>Data Fim</label><input type="date" value={filtros.data_fim} onChange={e => setFiltros(f => ({ ...f, data_fim: e.target.value }))} style={inputStyle} /></div>
          <button onClick={buscar} disabled={loading} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Buscando...' : 'Gerar Relatorio'}
          </button>
          {dados && <button onClick={() => gerarPDF(dados, filtros)} style={{ background: '#003366', color: '#fff', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Exportar PDF</button>}
        </div>
      </div>

      {dados && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { label: 'Viaturas', value: dados.resumo.total_viaturas, color: 'var(--accent)' },
            { label: 'KM Total Frota', value: Number(dados.resumo.km_total_frota).toLocaleString('pt-BR'), color: 'var(--green)' },
            { label: 'Media por Viatura', value: Number(dados.resumo.km_media).toLocaleString('pt-BR'), color: 'var(--yellow)' },
            { label: 'Total de Saidas', value: dados.resumo.total_saidas, color: 'var(--purple)' },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>{c.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {[
          { title: 'KM por Viatura', rows: dados.por_viatura, cols: ['Prefixo','Veiculo','Placa','KM Inicial','KM Final','KM Rodado','Saidas'],
            render: v => [
              <td style={{ padding:'10px 14px', fontFamily:'monospace', color:'var(--cyan)', fontWeight:700 }}>{v.prefixo}</td>,
              <td style={{ padding:'10px 14px' }}>{v.marca} {v.modelo}</td>,
              <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12 }}>{v.placa||'--'}</td>,
              <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12 }}>{Number(v.km_inicial).toLocaleString('pt-BR')}</td>,
              <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12 }}>{Number(v.km_final).toLocaleString('pt-BR')}</td>,
              <td style={{ padding:'10px 14px', fontFamily:'monospace', fontWeight:700, color:'var(--accent)' }}>{Number(v.km_rodado).toLocaleString('pt-BR')}</td>,
              <td style={{ padding:'10px 14px', textAlign:'center' }}>{v.total_saidas}</td>
            ]},
          { title: 'KM por Policial', rows: dados.por_policial, cols: ['RE','Nome de Guerra','Total Saidas','KM Total'],
            render: p => [
              <td style={{ padding:'10px 14px', fontFamily:'monospace', color:'var(--cyan)', fontSize:12 }}>{p.policial_re}</td>,
              <td style={{ padding:'10px 14px' }}>{p.policial_nome||'--'}</td>,
              <td style={{ padding:'10px 14px', textAlign:'center' }}>{p.total_saidas}</td>,
              <td style={{ padding:'10px 14px', fontFamily:'monospace', fontWeight:700, color:'var(--green)' }}>{Number(p.km_total).toLocaleString('pt-BR')}</td>
            ]}
        ].map(tab => (
          <div key={tab.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', fontWeight:600 }}>{tab.title}</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead><tr style={{ borderBottom:'1px solid var(--border2)' }}>{tab.cols.map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>{tab.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {tab.render(row)}
                  </tr>
                ))}</tbody>
              </table>
              {tab.rows.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Nenhum registro no periodo</div>}
            </div>
          </div>
        ))}
      </>}

      {!dados && !loading && <div style={{ textAlign:'center', color:'var(--text3)', padding:60 }}>Selecione o periodo e clique em Gerar Relatorio</div>}
    </div>
  );
}
