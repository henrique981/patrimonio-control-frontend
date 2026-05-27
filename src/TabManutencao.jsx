import React, { useState, useEffect, useCallback } from 'react';

const BASE = 'https://backend-production-32053.up.railway.app';

const api = {
  async get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); },
  async post(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  async put(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  }
};

const VIATURAS = ['I-06500','I-06510','I-06514','I-06515','I-06517','I-06518','I-06520','I-06522','I-06523','I-06530','I-06531','I-06532','I-06533','I-06534','I-06535','I-06550','I-06551','I-06560','I-06583','I-06584','I-06585','I-06586','I-06587','I-06588','I-06589'];

const OUTROS_TIPOS = [
  'Lanterna/Farol Quebrado','Vidro Danificado','Funilaria/Pintura',
  'Sistema Eletrico','Ar Condicionado','Bateria','Embreagem',
  'Cambio','Suspensao','Escapamento','Borrachas e Vedacoes','Reparo por Acidente/Colisao'
];

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'var(--border)', color: 'var(--text2)', width: 32, height: 32, borderRadius: 8, fontSize: 18, border: 'none', cursor: 'pointer' }}>x</button>
      </div>
      {children}
    </div>
  </div>
);

// Card de alerta
const AlertaCard = ({ alerta, onClick }) => (
  <div onClick={onClick} style={{
    background: alerta.status === 'vencido' ? '#ef444415' : '#f59e0b15',
    border: `1px solid ${alerta.status === 'vencido' ? '#ef4444' : '#f59e0b'}`,
    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
    transition: 'transform 0.15s'
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: alerta.status === 'vencido' ? '#ef4444' : '#f59e0b' }}>
          {alerta.prefixo}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{alerta.marca} {alerta.modelo}</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{alerta.label}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: 'var(--text2)' }}>KM Atual</div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{Number(alerta.km_atual).toLocaleString('pt-BR')}</div>
        <div style={{ fontSize: 11, color: alerta.status === 'vencido' ? '#ef4444' : '#f59e0b', fontWeight: 600, marginTop: 4 }}>
          {alerta.status === 'vencido' ? `Vencido ha ${Math.abs(alerta.km_restante).toLocaleString('pt-BR')} km` : `Faltam ${alerta.km_restante.toLocaleString('pt-BR')} km`}
        </div>
      </div>
    </div>
  </div>
);

export default function TabManutencao({ showToast, usuario }) {
  const [alertas, setAlertas] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [prefixoSel, setPrefixoSel] = useState('');
  const [historico, setHistorico] = useState([]);
  const [kmAtual, setKmAtual] = useState(0);
  const [tipos, setTipos] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [modal, setModal] = useState(null); // 'registrar' | 'config'
  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [subTipoOutros, setSubTipoOutros] = useState('');

  const carregarAlertas = useCallback(async () => {
    setLoadingAlertas(true);
    try {
      const res = await api.get('/manutencao/alertas');
      if (res.ok) setAlertas(res.alertas);
    } catch {}
    setLoadingAlertas(false);
  }, []);

  const carregarTipos = useCallback(async () => {
    try {
      const res = await api.get('/manutencao/tipos');
      if (res.ok) setTipos(res.tipos);
    } catch {}
  }, []);

  useEffect(() => { carregarAlertas(); carregarTipos(); }, [carregarAlertas, carregarTipos]);

  const carregarHistorico = async (prefixo) => {
    setLoadingHist(true);
    try {
      const res = await api.get(`/manutencao/${prefixo}`);
      if (res.ok) { setHistorico(res.historico); setKmAtual(res.km_atual); }
    } catch {}
    setLoadingHist(false);
  };

  const handlePrefixo = (p) => { setPrefixoSel(p); if (p) carregarHistorico(p); else setHistorico([]); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const abrirRegistrar = (alertaPrefixo = null) => {
    const p = alertaPrefixo || prefixoSel;
    if (!p) return showToast('Selecione uma viatura primeiro', 'error');
    if (alertaPrefixo) setPrefixoSel(p);
    setForm({ tipo: '', km_realizacao: '', descricao: '', empresa: '', custo: '' });
    setSubTipoOutros('');
    setModal('registrar');
  };

  const handleSalvar = async () => {
    if (!form.tipo) return showToast('Selecione o tipo de manutencao', 'error');
    if (!form.km_realizacao) return showToast('Informe o KM de realizacao', 'error');
    if (parseInt(form.km_realizacao) < kmAtual) return showToast(`KM nao pode ser menor que o KM atual da viatura (${kmAtual.toLocaleString('pt-BR')})`, 'error');

    const labelFinal = form.tipo === 'outros' && subTipoOutros ? subTipoOutros : undefined;

    setSalvando(true);
    try {
      const res = await api.post(`/manutencao/${prefixoSel}`, {
        ...form,
        label: labelFinal,
        km_realizacao: parseInt(form.km_realizacao),
        custo: form.custo ? parseFloat(form.custo) : null,
        usuario_re: usuario?.re || '',
        usuario_nome: usuario?.nome || ''
      });
      if (res.ok) {
        showToast('Manutencao registrada!', 'success');
        setModal(null);
        carregarHistorico(prefixoSel);
        carregarAlertas();
        if (res.km_proxima) showToast(`Proxima manutencao: ${res.km_proxima.toLocaleString('pt-BR')} km`, 'success');
      } else showToast(res.erro || 'Erro ao salvar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSalvando(false);
  };

  const inputStyle = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ALERTAS */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Alertas de Manutencao</h3>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{alertas.length} alerta(s)</span>
        </div>
        {loadingAlertas ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>Carregando alertas...</div>
        ) : alertas.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 20 }}>Nenhuma manutencao pendente</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {alertas.map((a, i) => (
              <AlertaCard key={i} alerta={a} onClick={() => { handlePrefixo(a.prefixo); abrirRegistrar(a.prefixo); }} />
            ))}
          </div>
        )}
      </div>

      {/* SELETOR DE VIATURA */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>Viatura</label>
          <select value={prefixoSel} onChange={e => handlePrefixo(e.target.value)}
            style={{ ...inputStyle, width: 180 }}>
            <option value="">Selecione...</option>
            {VIATURAS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {prefixoSel && (
          <>
            <button onClick={() => abrirRegistrar()} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              + Registrar Manutencao
            </button>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
              KM Atual: <strong style={{ fontFamily: 'monospace', color: 'var(--cyan)' }}>{kmAtual.toLocaleString('pt-BR')}</strong>
            </div>
          </>
        )}
      </div>

      {/* HISTÓRICO */}
      {prefixoSel && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Historico de Manutencoes — {prefixoSel}</span>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{historico.length} registros</span>
          </div>
          {loadingHist ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                    {['Data','Tipo','KM Realizacao','Proxima','Descricao','Empresa','Custo','Registrado por'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historico.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--text2)', fontSize: 12 }}>
                        {new Date(m.data_realizacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.label}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--cyan)' }}>
                        {Number(m.km_realizacao).toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: m.km_proxima ? 'var(--green)' : 'var(--text3)' }}>
                        {m.km_proxima ? Number(m.km_proxima).toLocaleString('pt-BR') : '--'}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text2)', fontSize: 12 }}>{m.descricao || '--'}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text2)', fontSize: 12 }}>{m.empresa || '--'}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12 }}>
                        {m.custo ? `R$ ${parseFloat(m.custo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>
                        {m.usuario_re ? `${m.usuario_re} - ${m.usuario_nome || ''}` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {historico.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Nenhuma manutencao registrada para esta viatura</div>}
            </div>
          )}
        </div>
      )}

      {/* MODAL REGISTRAR */}
      {modal === 'registrar' && (
        <Modal title={`Registrar Manutencao — ${prefixoSel}`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: 'var(--text2)' }}>
              KM Atual da Viatura: <strong style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>{kmAtual.toLocaleString('pt-BR')}</strong>
            </div>

            <div>
              <label style={labelStyle}>Tipo de Manutencao *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} style={inputStyle}>
                <option value="">Selecione...</option>
                <optgroup label="Manutencoes Periodicas">
                  {tipos.filter(t => t.intervalo_km).map(t => (
                    <option key={t.tipo} value={t.tipo}>{t.label} (a cada {t.intervalo_km.toLocaleString('pt-BR')} km)</option>
                  ))}
                </optgroup>
                <optgroup label="Outros">
                  <option value="outros">Outros (especificar)</option>
                </optgroup>
              </select>
            </div>

            {form.tipo === 'outros' && (
              <div>
                <label style={labelStyle}>Especificar *</label>
                <select value={subTipoOutros} onChange={e => setSubTipoOutros(e.target.value)} style={inputStyle}>
                  <option value="">Selecione...</option>
                  {OUTROS_TIPOS.map(o => <option key={o} value={o}>{o}</option>)}
                  <option value="__livre">Outro (digitar)</option>
                </select>
                {subTipoOutros === '__livre' && (
                  <input placeholder="Descreva o servico..." value={form.descricao_outros || ''} onChange={e => setForm(f => ({ ...f, descricao_outros: e.target.value }))}
                    style={{ ...inputStyle, marginTop: 8 }} />
                )}
              </div>
            )}

            <div>
              <label style={labelStyle}>KM de Realizacao * (minimo: {kmAtual.toLocaleString('pt-BR')})</label>
              <input type="number" name="km_realizacao" value={form.km_realizacao} onChange={handleChange}
                placeholder={`Minimo ${kmAtual}`} style={inputStyle} min={kmAtual} />
            </div>

            <div>
              <label style={labelStyle}>Descricao</label>
              <textarea name="descricao" value={form.descricao || ''} onChange={handleChange} rows={2}
                placeholder="Observacoes sobre o servico..." style={{ ...inputStyle, resize: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Empresa / Mecanico</label>
                <input name="empresa" value={form.empresa || ''} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Custo (R$)</label>
                <input type="number" name="custo" value={form.custo || ''} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button onClick={handleSalvar} disabled={salvando} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, opacity: salvando ? 0.7 : 1 }}>
              {salvando ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
