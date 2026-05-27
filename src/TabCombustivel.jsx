import React, { useState, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';
const api = {
  async get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); },
  async post(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  }
};

const VIATURAS = ['I-06500','I-06510','I-06514','I-06515','I-06517','I-06518','I-06520','I-06522','I-06523','I-06530','I-06531','I-06532','I-06533','I-06534','I-06535','I-06550','I-06551','I-06560','I-06583','I-06584','I-06585','I-06586','I-06587','I-06588','I-06589'];

const MESES = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:20, overflowY:'auto' }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:16, padding:28, width:'100%', maxWidth:520, marginTop:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ fontSize:16, fontWeight:700 }}>{title}</h3>
        <button onClick={onClose} style={{ background:'var(--border)', color:'var(--text2)', width:32, height:32, borderRadius:8, fontSize:18, border:'none', cursor:'pointer' }}>x</button>
      </div>
      {children}
    </div>
  </div>
);

const gerarPDF = (dados) => {
  const agora = new Date().toLocaleString('pt-BR');
  const html = `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatorio Mensal</title>
    <style>
      * { margin:0;padding:0;box-sizing:border-box; }
      body { font-family:Arial,sans-serif;color:#1a2035;padding:24px;font-size:11px; }
      .header { background:#003366;color:white;padding:16px 20px;border-radius:8px;margin-bottom:16px; }
      .header h1 { font-size:15px;font-weight:700; }
      .header p { font-size:11px;opacity:0.8;margin-top:3px; }
      .cards { display:flex;gap:12px;margin-bottom:16px; }
      .card { background:#f3f4f6;border-radius:6px;padding:10px 14px;flex:1;text-align:center; }
      .card .num { font-size:18px;font-weight:700;color:#003366; }
      .card .label { font-size:9px;color:#6b7280;text-transform:uppercase;margin-top:2px; }
      h2 { font-size:12px;font-weight:700;color:#003366;margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid #003366; }
      table { width:100%;border-collapse:collapse;font-size:10px;margin-bottom:16px; }
      th { background:#f3f4f6;padding:5px 8px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb; }
      td { padding:5px 8px;border-bottom:1px solid #f3f4f6; }
      tr:nth-child(even) td { background:#fafafa; }
      .rodape { margin-top:16px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:9px;color:#9ca3af;text-align:center; }
      @media print { body { padding:10px; } }
    </style></head><body>
    <div class="header">
      <h1>Policia Militar do Estado de Sao Paulo — 5a CIA PM | 6o BPM/I</h1>
      <p>Relatorio Mensal de Viaturas — ${dados.mes} / ${dados.ano}</p>
      <p>Gerado em: ${agora}</p>
    </div>
    <div class="cards">
      <div class="card"><div class="num">${dados.resumo.total_viaturas}</div><div class="label">Viaturas em Servico</div></div>
      <div class="card"><div class="num">${Number(dados.resumo.km_total).toLocaleString('pt-BR')}</div><div class="label">KM Total Frota</div></div>
      <div class="card"><div class="num">${Number(dados.resumo.total_litros).toLocaleString('pt-BR')} L</div><div class="label">Total Combustivel</div></div>
      <div class="card"><div class="num">R$ ${Number(dados.resumo.total_combustivel).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div><div class="label">Custo Combustivel</div></div>
    </div>
    <h2>KM Rodado por Viatura</h2>
    <table>
      <thead><tr><th>#</th><th>Prefixo</th><th>Veiculo</th><th>Placa</th><th>KM Rodado</th><th>Saidas</th></tr></thead>
      <tbody>${dados.km_por_viatura.map((v,i) => `
        <tr><td>${i+1}</td><td><strong>${v.prefixo}</strong></td><td>${v.marca} ${v.modelo}</td><td>${v.placa||'--'}</td>
        <td style="font-weight:700;color:#003366">${Number(v.km_rodado).toLocaleString('pt-BR')} km</td><td>${v.total_saidas}</td></tr>
      `).join('')}</tbody>
    </table>
    ${dados.abastecimentos.length > 0 ? `
    <h2>Abastecimentos por Viatura</h2>
    <table>
      <thead><tr><th>#</th><th>Prefixo</th><th>Abastecimentos</th><th>Total Litros</th><th>Total Valor</th></tr></thead>
      <tbody>${dados.abastecimentos.map((a,i) => `
        <tr><td>${i+1}</td><td><strong>${a.prefixo}</strong></td><td>${a.total_abast}</td>
        <td>${Number(a.total_litros||0).toLocaleString('pt-BR')} L</td>
        <td>R$ ${Number(a.total_valor||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>
      `).join('')}</tbody>
    </table>` : ''}
    <div class="rodape">5a CIA PM | 6o BPM/I — Relatorio Mensal — ${agora}</div>
    </body></html>
  `;
  const janela = window.open('', '_blank');
  janela.document.write(html);
  janela.document.close();
  setTimeout(() => janela.print(), 500);
};

export default function TabCombustivel({ showToast, usuario }) {
  const [aba, setAba] = useState('registrar'); // registrar | historico | relatorio
  const [prefixo, setPrefixo] = useState('');
  const [historico, setHistorico] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [form, setForm] = useState({ tipo_combustivel: 'gasolina' });
  const [salvando, setSalvando] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [loadingRel, setLoadingRel] = useState(false);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));

  const carregarHistorico = async (p) => {
    setLoadingHist(true);
    try {
      const res = await api.get(`/combustivel/${p}`);
      if (res.ok) setHistorico(res.historico);
    } catch {}
    setLoadingHist(false);
  };

  const handlePrefixo = (p) => { setPrefixo(p); if (p) carregarHistorico(p); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSalvar = async () => {
    if (!prefixo) return showToast('Selecione uma viatura', 'error');
    if (!form.km_abastecimento) return showToast('Informe o KM', 'error');
    setSalvando(true);
    try {
      const res = await api.post(`/combustivel/${prefixo}`, {
        ...form,
        km_abastecimento: parseInt(form.km_abastecimento),
        litros: form.litros ? parseFloat(form.litros) : null,
        valor_total: form.valor_total ? parseFloat(form.valor_total) : null,
        valor_litro: form.valor_litro ? parseFloat(form.valor_litro) : null,
        usuario_re: usuario?.re || '',
        usuario_nome: usuario?.nome || ''
      });
      if (res.ok) {
        showToast('Abastecimento registrado!', 'success');
        setForm({ tipo_combustivel: 'gasolina' });
        if (aba === 'historico') carregarHistorico(prefixo);
      } else showToast(res.erro || 'Erro ao salvar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSalvando(false);
  };

  const carregarRelatorio = async () => {
    setLoadingRel(true);
    try {
      const res = await api.get(`/combustivel/relatorio/mensal?mes=${mes}&ano=${ano}`);
      if (res.ok) setRelatorio(res);
      else showToast(res.erro || 'Erro', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setLoadingRel(false);
  };

  const inputStyle = { width:'100%', background:'var(--bg)', border:'1px solid var(--border2)', color:'var(--text)', borderRadius:8, padding:'9px 12px', fontSize:13, outline:'none' };
  const labelStyle = { display:'block', fontSize:11, fontWeight:700, color:'var(--text2)', marginBottom:5, textTransform:'uppercase' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Abas internas */}
      <div style={{ display:'flex', gap:8 }}>
        {[['registrar','Registrar Abastecimento'],['historico','Historico'],['relatorio','Relatorio Mensal']].map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)} style={{
            background: aba === id ? 'var(--accent)' : 'var(--bg2)',
            color: aba === id ? '#fff' : 'var(--text2)',
            border: `1px solid ${aba === id ? 'var(--accent)' : 'var(--border)'}`,
            padding:'7px 16px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13
          }}>{label}</button>
        ))}
      </div>

      {/* REGISTRAR */}
      {aba === 'registrar' && (
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ gridColumn:'span 2' }}>
              <label style={labelStyle}>Viatura *</label>
              <select value={prefixo} onChange={e => handlePrefixo(e.target.value)} style={inputStyle}>
                <option value="">Selecione...</option>
                {VIATURAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>KM do Abastecimento *</label>
              <input type="number" name="km_abastecimento" value={form.km_abastecimento||''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Combustivel</label>
              <select name="tipo_combustivel" value={form.tipo_combustivel} onChange={handleChange} style={inputStyle}>
                <option value="gasolina">Gasolina</option>
                <option value="etanol">Etanol</option>
                <option value="flex">Flex</option>
                <option value="diesel">Diesel</option>
                <option value="gnv">GNV</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Litros</label>
              <input type="number" step="0.01" name="litros" value={form.litros||''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Valor por Litro (R$)</label>
              <input type="number" step="0.001" name="valor_litro" value={form.valor_litro||''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Valor Total (R$)</label>
              <input type="number" step="0.01" name="valor_total" value={form.valor_total||''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Posto</label>
              <input name="posto" value={form.posto||''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nota Fiscal</label>
              <input name="nota_fiscal" value={form.nota_fiscal||''} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
            <button onClick={handleSalvar} disabled={salvando} style={{ background:'var(--accent)', color:'#fff', padding:'10px 24px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, opacity: salvando ? 0.7 : 1 }}>
              {salvando ? 'Salvando...' : 'Registrar Abastecimento'}
            </button>
          </div>
        </div>
      )}

      {/* HISTORICO */}
      {aba === 'historico' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <div>
              <label style={labelStyle}>Viatura</label>
              <select value={prefixo} onChange={e => handlePrefixo(e.target.value)}
                style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--text)', borderRadius:8, padding:'8px 12px', fontSize:13, minWidth:160 }}>
                <option value="">Selecione...</option>
                {VIATURAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {prefixo && (
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', fontWeight:600 }}>
                Historico de Abastecimentos — {prefixo}
              </div>
              {loadingHist ? (
                <div style={{ padding:40, textAlign:'center', color:'var(--text3)' }}>Carregando...</div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid var(--border2)' }}>
                        {['Data','KM','Combustivel','Litros','Valor/L','Total','Posto','NF'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map(a => (
                        <tr key={a.id} style={{ borderBottom:'1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding:'10px 14px', fontSize:12, color:'var(--text2)', whiteSpace:'nowrap' }}>{new Date(a.data_abastecimento).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'monospace', color:'var(--cyan)' }}>{Number(a.km_abastecimento).toLocaleString('pt-BR')}</td>
                          <td style={{ padding:'10px 14px', fontSize:12 }}>{a.tipo_combustivel}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12 }}>{a.litros ? `${Number(a.litros).toLocaleString('pt-BR')} L` : '--'}</td>
                          <td style={{ padding:'10px 14px', fontSize:12 }}>{a.valor_litro ? `R$ ${Number(a.valor_litro).toLocaleString('pt-BR',{minimumFractionDigits:3})}` : '--'}</td>
                          <td style={{ padding:'10px 14px', fontWeight:600, color:'var(--green)' }}>{a.valor_total ? `R$ ${Number(a.valor_total).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '--'}</td>
                          <td style={{ padding:'10px 14px', fontSize:12, color:'var(--text2)' }}>{a.posto || '--'}</td>
                          <td style={{ padding:'10px 14px', fontSize:12, color:'var(--text2)' }}>{a.nota_fiscal || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {historico.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Nenhum abastecimento registrado</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* RELATORIO MENSAL */}
      {aba === 'relatorio' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
              <div>
                <label style={labelStyle}>Mes</label>
                <select value={mes} onChange={e => setMes(e.target.value)}
                  style={{ background:'var(--bg)', border:'1px solid var(--border2)', color:'var(--text)', borderRadius:8, padding:'8px 12px', fontSize:13 }}>
                  {MESES.map((m,i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ano</label>
                <select value={ano} onChange={e => setAno(e.target.value)}
                  style={{ background:'var(--bg)', border:'1px solid var(--border2)', color:'var(--text)', borderRadius:8, padding:'8px 12px', fontSize:13 }}>
                  {[2024,2025,2026,2027].map(a => <option key={a} value={String(a)}>{a}</option>)}
                </select>
              </div>
              <button onClick={carregarRelatorio} disabled={loadingRel} style={{ background:'var(--accent)', color:'#fff', padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, opacity: loadingRel ? 0.7 : 1 }}>
                {loadingRel ? 'Gerando...' : 'Gerar Relatorio'}
              </button>
              {relatorio && (
                <button onClick={() => gerarPDF(relatorio)} style={{ background:'#003366', color:'#fff', padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600 }}>
                  Exportar PDF
                </button>
              )}
            </div>
          </div>

          {relatorio && (
            <>
              {/* Cards resumo */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
                {[
                  { label:'Viaturas em Servico', value: relatorio.resumo.total_viaturas, color:'var(--accent)' },
                  { label:'KM Total Frota', value: Number(relatorio.resumo.km_total).toLocaleString('pt-BR') + ' km', color:'var(--green)' },
                  { label:'Total Combustivel', value: Number(relatorio.resumo.total_litros).toLocaleString('pt-BR') + ' L', color:'var(--yellow)' },
                  { label:'Custo Total', value: 'R$ ' + Number(relatorio.resumo.total_combustivel).toLocaleString('pt-BR',{minimumFractionDigits:2}), color:'var(--red)' },
                ].map(c => (
                  <div key={c.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:700, color:c.color, fontFamily:'var(--font-mono)' }}>{c.value}</div>
                    <div style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', marginTop:4 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabela KM por viatura */}
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', fontWeight:600 }}>
                  KM Rodado por Viatura — {relatorio.mes}/{relatorio.ano}
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid var(--border2)' }}>
                        {['#','Prefixo','Veiculo','Placa','KM Rodado','Saidas'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.km_por_viatura.map((v, i) => (
                        <tr key={v.prefixo} style={{ borderBottom:'1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding:'10px 14px', color:'var(--text2)', fontSize:12 }}>{i+1}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'monospace', color:'var(--cyan)', fontWeight:700 }}>{v.prefixo}</td>
                          <td style={{ padding:'10px 14px' }}>{v.marca} {v.modelo}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12 }}>{v.placa||'--'}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'monospace', fontWeight:700, color:'var(--accent)' }}>{Number(v.km_rodado).toLocaleString('pt-BR')} km</td>
                          <td style={{ padding:'10px 14px', textAlign:'center' }}>{v.total_saidas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {relatorio.km_por_viatura.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Nenhum registro neste mes</div>}
                </div>
              </div>
            </>
          )}

          {!relatorio && !loadingRel && (
            <div style={{ textAlign:'center', color:'var(--text3)', padding:60 }}>Selecione o mes e clique em Gerar Relatorio</div>
          )}
        </div>
      )}
    </div>
  );
}
