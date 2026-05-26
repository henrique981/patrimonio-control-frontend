import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import TabHistorico from './TabHistorico';
import Login from './Login';
import TabUsuarios from './TabUsuarios';

const GlobalStyle = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0c10; --bg2: #0f1117; --bg3: #161b24;
      --border: #1e2535; --border2: #2a3347;
      --text: #e8edf5; --text2: #8892a4; --text3: #4a5568;
      --accent: #3b82f6; --accent2: #1d4ed8;
      --green: #10b981; --red: #ef4444; --yellow: #f59e0b;
      --purple: #8b5cf6; --cyan: #06b6d4;
      --font-mono: 'Space Mono', monospace;
      --font-sans: 'DM Sans', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); min-height: 100vh; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
    input, select, textarea {
      font-family: var(--font-sans); background: var(--bg);
      border: 1px solid var(--border2); color: var(--text);
      border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--accent); }
    input::placeholder { color: var(--text3); }
    button { font-family: var(--font-sans); cursor: pointer; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; transition: all 0.15s; }
    button:active { transform: scale(0.97); }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.3s ease forwards; }
  `}</style>
);

const Badge = ({ status }) => {
  const map = {
    operacional:         { color: '#10b981', bg: '#10b98120', label: 'Operacional' },
    baixada:             { color: '#06b6d4', bg: '#06b6d420', label: 'Baixada' },
    descarga:            { color: '#ef4444', bg: '#ef444420', label: 'Descarga' },
    inservivel:          { color: '#ef4444', bg: '#ef444420', label: 'Inservivel' },
    inexistente:         { color: '#8b5cf6', bg: '#8b5cf620', label: 'Inexistente' },
    em_manutencao:       { color: '#06b6d4', bg: '#06b6d420', label: 'Manutencao' },
    extraviado:          { color: '#ef4444', bg: '#ef444420', label: 'Extraviado' },
    aguardando_descarga: { color: '#f59e0b', bg: '#f59e0b20', label: 'Ag. Descarga' },
    aguardando_liberacao:{ color: '#f59e0b', bg: '#f59e0b20', label: 'Ag. Liberacao' },
    reserva:             { color: '#8892a4', bg: '#8892a420', label: 'Reserva' },
  };
  const s = map[status] || { color: '#8892a4', bg: '#8892a420', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
    <div style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: type === 'error' ? '#ef444420' : '#10b98120', border: `1px solid ${type === 'error' ? '#ef4444' : '#10b981'}`, color: type === 'error' ? '#ef4444' : '#10b981', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 600, animation: 'fadeIn 0.3s ease', maxWidth: 320 }}>
      {msg}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 580, marginTop: 20, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'var(--border)', color: 'var(--text2)', width: 32, height: 32, borderRadius: 8, fontSize: 18, lineHeight: 1 }}>x</button>
      </div>
      {children}
    </div>
  </div>
);

const FormField = ({ label, name, value, onChange, type = 'text', options, required, span }) => (
  <div style={{ gridColumn: span ? `span ${span}` : 'span 1' }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
    </label>
    {options ? (
      <select name={name} value={value || ''} onChange={onChange} style={{ width: '100%' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value || ''} onChange={onChange} style={{ width: '100%' }} />
    )}
  </div>
);

const SITUACOES_ITEM = [
  { value: 'operacional', label: 'Operacional' },
  { value: 'inservivel', label: 'Inservivel' },
  { value: 'descarga', label: 'Descarga' },
  { value: 'inexistente', label: 'Inexistente' },
  { value: 'em_manutencao', label: 'Em Manutencao' },
  { value: 'extraviado', label: 'Extraviado' },
  { value: 'aguardando_descarga', label: 'Aguardando Descarga' },
];

const SITUACOES_VTR = [
  { value: 'operacional', label: 'Operacional' },
  { value: 'baixada',     label: 'Baixada' },
  { value: 'descarga',    label: 'Descarga' },
];

const COR_SITUACAO = { operacional: '#10b981', baixada: '#06b6d4', descarga: '#ef4444' };
const LABEL_SITUACAO = { operacional: 'Operacional', baixada: 'Baixada', descarga: 'Descarga' };

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', borderLeft: `3px solid ${color}`, animation: 'fadeIn 0.4s ease' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 28, opacity: 0.6 }}>{icon}</div>
    </div>
  </div>
);

const Table = ({ columns, data, onEdit, onDelete }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border2)' }}>
          {columns.map(c => <th key={c.key} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{c.label}</th>)}
          <th style={{ padding: '10px 14px', width: 100 }}></th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {columns.map(c => (
              <td key={c.key} style={{ padding: '10px 14px', color: c.mono ? 'var(--cyan)' : 'var(--text)', fontFamily: c.mono ? 'var(--font-mono)' : 'inherit', fontSize: c.mono ? 12 : 13, whiteSpace: 'nowrap' }}>
                {c.key === 'situacao' ? <Badge status={row[c.key]} /> : (row[c.key] || <span style={{ color: 'var(--text3)' }}>--</span>)}
              </td>
            ))}
            <td style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onEdit(row)} style={{ background: '#3b82f620', color: 'var(--accent)', border: '1px solid #3b82f640', padding: '4px 10px', fontSize: 12 }}>Editar</button>
                <button onClick={() => onDelete(row)} style={{ background: '#ef444420', color: 'var(--red)', border: '1px solid #ef444440', padding: '4px 10px', fontSize: 12 }}>Excluir</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {data.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Nenhum registro encontrado</div>}
  </div>
);

// GRAFICO VIATURAS
const GraficoViaturas = ({ data }) => {
  const ORDEM = ['operacional', 'baixada', 'descarga'];
  const dadosCompletos = ORDEM.map(sit => {
    const found = data.find(d => d.situacao === sit);
    return { situacao: sit, total: found ? found.total : '0' };
  }).filter(d => parseInt(d.total) > 0);
  const total = dadosCompletos.reduce((a, b) => a + parseInt(b.total), 0);
  if (total === 0) return null;

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
  };

  const fatias = [];
  let angulo = -90;
  for (const item of dadosCompletos) {
    const pct = parseInt(item.total) / total;
    fatias.push({ ...item, pct, inicio: angulo, fim: angulo + pct * 360 });
    angulo += pct * 360;
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Situacao das Viaturas</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <svg viewBox="0 0 120 120" width={120} height={120} style={{ flexShrink: 0 }}>
          {fatias.map((f, i) => (
            <path key={i} d={f.pct === 1 ? `M 60 60 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0` : describeArc(60, 60, 50, f.inicio, f.fim)} fill={COR_SITUACAO[f.situacao] || '#8892a4'} stroke="var(--bg2)" strokeWidth={2} />
          ))}
          <circle cx={60} cy={60} r={28} fill="var(--bg2)" />
          <text x={60} y={56} textAnchor="middle" fill="var(--text)" fontSize={14} fontWeight={700}>{total}</text>
          <text x={60} y={70} textAnchor="middle" fill="var(--text2)" fontSize={8}>viaturas</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {dadosCompletos.map(item => (
            <div key={item.situacao} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COR_SITUACAO[item.situacao] || '#8892a4', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{LABEL_SITUACAO[item.situacao] || item.situacao}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{item.total}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{Math.round(parseInt(item.total)/total*100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// TAB RESUMO
const TabResumo = ({ resumo }) => {
  if (!resumo) return <Spinner />;
  const totalItens = resumo.itens_patrimoniais.reduce((a, b) => a + parseInt(b.total), 0);
  const totalArmas = resumo.armas.reduce((a, b) => a + parseInt(b.total), 0);
  const totalVtrs  = resumo.viaturas.reduce((a, b) => a + parseInt(b.total), 0);
  const valorVtrs  = parseFloat(resumo.valor_total_viaturas || 0);
  const valorTotal = (parseFloat(resumo.valor_total_itens || 0) + parseFloat(resumo.valor_total_armas || 0) + valorVtrs).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Itens Patrimoniais" value={totalItens} sub={`R$ ${parseFloat(resumo.valor_total_itens||0).toLocaleString('pt-BR')}`} color="var(--accent)" icon="P" />
        <StatCard label="Armamento" value={totalArmas} sub={`R$ ${parseFloat(resumo.valor_total_armas||0).toLocaleString('pt-BR')}`} color="var(--red)" icon="A" />
        <StatCard label="Viaturas" value={totalVtrs} sub={`R$ ${valorVtrs.toLocaleString('pt-BR', {minimumFractionDigits:2})}`} color="var(--green)" icon="V" />
        <StatCard label="Patrimonio Total" value={valorTotal} sub="Valor consolidado" color="var(--yellow)" icon="$" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <GraficoViaturas data={resumo.viaturas} />
      </div>
    </div>
  );
};

// TAB ITENS
const TabItens = ({ showToast }) => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [filtroUnidade, setFiltroUnidade] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let url = '/patrimonio/itens?';
    if (filtroSituacao) url += `situacao=${filtroSituacao}&`;
    if (filtroUnidade)  url += `unidade_opm=${filtroUnidade}&`;
    if (search)         url += `search=${search}&`;
    const res = await api.get(url);
    setItens(res.dados || []);
    setLoading(false);
  }, [search, filtroSituacao, filtroUnidade]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ situacao: 'operacional', unidade_opm: '606065000' }); setModal('add'); };
  const openEdit = (row) => { setForm({ ...row }); setSelected(row); setModal('edit'); };
  const openDelete = (row) => { setSelected(row); setModal('delete'); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      let res;
      if (modal === 'add') res = await api.post('/patrimonio/itens', form);
      else res = await api.put(`/patrimonio/itens/${selected.patrimonio}`, form);
      if (res.ok) { showToast(modal === 'add' ? 'Item inserido!' : 'Item atualizado!', 'success'); setModal(null); load(); }
      else showToast(res.erro || 'Erro ao salvar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await api.delete(`/patrimonio/itens/${selected.patrimonio}`);
      if (res.ok) { showToast('Item excluido!', 'success'); setModal(null); load(); }
      else showToast(res.erro || 'Erro ao excluir', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSaving(false);
  };

  const cols = [
    { key: 'patrimonio', label: 'Patrimonio', mono: true },
    { key: 'nome_material', label: 'Material' },
    { key: 'responsavel_nome', label: 'Detentor' },
    { key: 'local_guarda', label: 'Local' },
    { key: 'unidade_opm', label: 'Unidade' },
    { key: 'situacao', label: 'Situacao' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Buscar por nome, patrimonio ou serie..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 240 }} />
        <select value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">Todas situacoes</option>
          {SITUACOES_ITEM.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filtroUnidade} onChange={e => setFiltroUnidade(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">Todas unidades</option>
          <option value="606065000">606065000</option>
          <option value="606065400">606065400</option>
        </select>
        <button onClick={openAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 18px' }}>+ Novo Item</button>
      </div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>Itens Patrimoniais</span>
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>{itens.length} registros</span>
        </div>
        {loading ? <Spinner /> : <Table columns={cols} data={itens} onEdit={openEdit} onDelete={openDelete} />}
      </div>
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Item' : 'Editar Item'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Patrimonio" name="patrimonio" value={form.patrimonio} onChange={handleChange} required span={modal === 'add' ? 1 : 2} />
            {modal === 'add' && <FormField label="N Serie" name="n_serie" value={form.n_serie} onChange={handleChange} />}
            <FormField label="Nome do Material" name="nome_material" value={form.nome_material} onChange={handleChange} required span={2} />
            <FormField label="Especificacoes" name="especificacoes" value={form.especificacoes} onChange={handleChange} span={2} />
            <FormField label="Unidade OPM" name="unidade_opm" value={form.unidade_opm} onChange={handleChange} options={[{ value: '606065000', label: '606065000' }, { value: '606065400', label: '606065400' }]} required />
            <FormField label="Situacao" name="situacao" value={form.situacao} onChange={handleChange} options={SITUACOES_ITEM} required />
            <FormField label="Valor (R$)" name="valor" value={form.valor} onChange={handleChange} type="number" />
            <FormField label="Conta PAT" name="conta_pat" value={form.conta_pat} onChange={handleChange} />
            <FormField label="Local de Guarda" name="local_guarda" value={form.local_guarda} onChange={handleChange} span={2} />
            <FormField label="Responsavel RE" name="responsavel_re" value={form.responsavel_re} onChange={handleChange} />
            <FormField label="Responsavel Nome" name="responsavel_nome" value={form.responsavel_nome} onChange={handleChange} />
            <FormField label="Observacao" name="observacao" value={form.observacao} onChange={handleChange} span={2} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 20px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title="Confirmar Exclusao" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Deseja excluir o item <strong style={{ color: 'var(--text)' }}>{selected?.nome_material}</strong>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px' }}>Cancelar</button>
            <button onClick={handleDelete} disabled={saving} style={{ background: 'var(--red)', color: '#fff', padding: '9px 20px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Excluindo...' : 'Confirmar'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// TAB ARMAS
const TabArmas = ({ showToast }) => {
  const [armas, setArmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let url = '/patrimonio/armas?';
    if (filtroSituacao) url += `situacao=${filtroSituacao}&`;
    if (search)         url += `search=${search}&`;
    const res = await api.get(url);
    setArmas(res.dados || []);
    setLoading(false);
  }, [search, filtroSituacao]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ situacao: 'operacional', unidade_opm: '606065000' }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setSelected(row); setModal('edit'); };
  const openDelete = row => { setSelected(row); setModal('delete'); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      let res;
      if (modal === 'add') res = await api.post('/patrimonio/armas', form);
      else res = await api.put(`/patrimonio/armas/${selected.patrimonio}`, form);
      if (res.ok) { showToast(modal === 'add' ? 'Arma inserida!' : 'Arma atualizada!', 'success'); setModal(null); load(); }
      else showToast(res.erro || 'Erro ao salvar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await api.delete(`/patrimonio/armas/${selected.patrimonio}`);
      if (res.ok) { showToast('Arma excluida!', 'success'); setModal(null); load(); }
      else showToast(res.erro || 'Erro ao excluir', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSaving(false);
  };

  const cols = [
    { key: 'patrimonio', label: 'Patrimonio', mono: true },
    { key: 'nome_material', label: 'Armamento' },
    { key: 'n_serie', label: 'N Serie', mono: true },
    { key: 'detentor_re', label: 'RE Detentor', mono: true },
    { key: 'detentor_nome', label: 'Detentor' },
    { key: 'situacao', label: 'Situacao' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Buscar por nome, patrimonio, serie ou RE..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 240 }} />
        <select value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">Todas situacoes</option>
          {SITUACOES_ITEM.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={openAdd} style={{ background: 'var(--red)', color: '#fff', padding: '8px 18px' }}>+ Nova Arma</button>
      </div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>Armamento</span>
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>{armas.length} registros</span>
        </div>
        {loading ? <Spinner /> : <Table columns={cols} data={armas} onEdit={openEdit} onDelete={openDelete} />}
      </div>
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Nova Arma' : 'Editar Arma'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Patrimonio" name="patrimonio" value={form.patrimonio} onChange={handleChange} required />
            <FormField label="N Serie" name="n_serie" value={form.n_serie} onChange={handleChange} />
            <FormField label="Nome do Armamento" name="nome_material" value={form.nome_material} onChange={handleChange} required span={2} />
            <FormField label="Fabricante" name="fabricante" value={form.fabricante} onChange={handleChange} options={[{ value: 'GLOCK', label: 'GLOCK' }, { value: 'TAURUS', label: 'TAURUS' }, { value: 'OUTRO', label: 'Outro' }]} />
            <FormField label="Situacao" name="situacao" value={form.situacao} onChange={handleChange} options={SITUACOES_ITEM} required />
            <FormField label="Detentor RE" name="detentor_re" value={form.detentor_re} onChange={handleChange} />
            <FormField label="Detentor Nome" name="detentor_nome" value={form.detentor_nome} onChange={handleChange} />
            <FormField label="UGE" name="uge" value={form.uge} onChange={handleChange} />
            <FormField label="Valor (R$)" name="valor" value={form.valor} onChange={handleChange} type="number" />
            <FormField label="Observacao" name="observacao" value={form.observacao} onChange={handleChange} span={2} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 20px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title="Confirmar Exclusao" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Deseja excluir <strong style={{ color: 'var(--text)' }}>{selected?.nome_material}</strong>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px' }}>Cancelar</button>
            <button onClick={handleDelete} disabled={saving} style={{ background: 'var(--red)', color: '#fff', padding: '9px 20px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Excluindo...' : 'Confirmar'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// TAB VIATURAS
const TabViaturas = ({ showToast }) => {
  const [viaturas, setViaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let url = '/patrimonio/viaturas?unidade_opm=606065000';
    if (filtroSituacao) url += `&situacao=${filtroSituacao}`;
    const res = await api.get(url);
    setViaturas(res.dados || []);
    setLoading(false);
  }, [filtroSituacao]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ situacao: 'operacional', unidade_opm: '606065000', combustivel: 'flex', km_atual: 0 }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setSelected(row); setModal('edit'); };
  const openDelete = row => { setSelected(row); setModal('delete'); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      let res;
      if (modal === 'add') res = await api.post('/patrimonio/viaturas', form);
      else res = await api.put(`/patrimonio/viaturas/${selected.prefixo}`, form);
      if (res.ok) { showToast(modal === 'add' ? 'Viatura inserida!' : 'Viatura atualizada!', 'success'); setModal(null); load(); }
      else showToast(res.erro || 'Erro ao salvar', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await api.delete(`/patrimonio/viaturas/${selected.prefixo}`);
      if (res.ok) { showToast('Viatura excluida!', 'success'); setModal(null); load(); }
      else showToast(res.erro || 'Erro ao excluir', 'error');
    } catch { showToast('Erro de conexao', 'error'); }
    setSaving(false);
  };

  const cols = [
    { key: 'prefixo', label: 'Prefixo', mono: true },
    { key: 'placa', label: 'Placa', mono: true },
    { key: 'tipo', label: 'Tipo' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'km_atual', label: 'KM Atual' },
    { key: 'situacao', label: 'Situacao' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value)} style={{ minWidth: 180 }}>
          <option value="">Todas situacoes</option>
          {SITUACOES_VTR.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={openAdd} style={{ background: 'var(--green)', color: '#fff', padding: '8px 18px' }}>+ Nova Viatura</button>
      </div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>Frota de Viaturas</span>
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>{viaturas.length} viaturas</span>
        </div>
        {loading ? <Spinner /> : <Table columns={cols} data={viaturas} onEdit={openEdit} onDelete={openDelete} />}
      </div>
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Nova Viatura' : 'Editar Viatura'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Patrimonio" name="patrimonio" value={form.patrimonio} onChange={handleChange} required />
            <FormField label="Prefixo" name="prefixo" value={form.prefixo} onChange={handleChange} required />
            <FormField label="Placa" name="placa" value={form.placa} onChange={handleChange} />
            <FormField label="Tipo" name="tipo" value={form.tipo} onChange={handleChange} />
            <FormField label="Marca" name="marca" value={form.marca} onChange={handleChange} />
            <FormField label="Modelo" name="modelo" value={form.modelo} onChange={handleChange} />
            <FormField label="Ano Fabricacao" name="ano_fabricacao" value={form.ano_fabricacao} onChange={handleChange} type="number" />
            <FormField label="Ano Modelo" name="ano_modelo" value={form.ano_modelo} onChange={handleChange} type="number" />
            <FormField label="Cor" name="cor" value={form.cor} onChange={handleChange} />
            <FormField label="Combustivel" name="combustivel" value={form.combustivel} onChange={handleChange} options={[{ value: 'gasolina', label: 'Gasolina' }, { value: 'etanol', label: 'Etanol' }, { value: 'flex', label: 'Flex' }, { value: 'diesel', label: 'Diesel' }]} />
            <FormField label="KM Atual" name="km_atual" value={form.km_atual} onChange={handleChange} type="number" />
            <FormField label="Situacao" name="situacao" value={form.situacao} onChange={handleChange} options={SITUACOES_VTR} required />
            <FormField label="Chassi" name="chassi" value={form.chassi} onChange={handleChange} />
            <FormField label="RENAVAM" name="renavam" value={form.renavam} onChange={handleChange} />
            <FormField label="Observacao" name="observacao" value={form.observacao} onChange={handleChange} span={2} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 20px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title="Confirmar Exclusao" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Deseja excluir a viatura <strong style={{ color: 'var(--text)' }}>{selected?.prefixo}</strong>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setModal(null)} style={{ background: 'var(--border)', color: 'var(--text2)', padding: '9px 20px' }}>Cancelar</button>
            <button onClick={handleDelete} disabled={saving} style={{ background: 'var(--red)', color: '#fff', padding: '9px 20px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Excluindo...' : 'Confirmar'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// APP PRINCIPAL
export default function App() {
  const [aba, setAba] = useState('resumo');
  const [resumo, setResumo] = useState(null);
  const [toast, setToast] = useState(null);
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('patrimonio_usuario')); } catch { return null; }
  });

  const carregarResumo = useCallback(() => {
    api.get('/patrimonio/resumo').then(r => { if (r.ok) setResumo(r.resumo); });
  }, []);

  useEffect(() => {
    if (usuario) carregarResumo();
  }, [carregarResumo, aba, usuario]);

  const showToast = (msg, type) => setToast({ msg, type });

  const handleLogin = (user) => { setUsuario(user); };

  const handleLogout = () => {
    sessionStorage.removeItem('patrimonio_token');
    sessionStorage.removeItem('patrimonio_usuario');
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={handleLogin} />;

  const abas = [
    { id: 'resumo',    label: 'Resumo' },
    { id: 'itens',     label: 'Itens' },
    { id: 'armas',     label: 'Armamento' },
    { id: 'viaturas',  label: 'Viaturas' },
    { id: 'historico', label: 'Historico VTR' },
    ...(usuario?.perfil === 'gestor' ? [{ id: 'usuarios', label: 'Usuarios' }] : []),
  ];

  return (
    <>
      <GlobalStyle />
      <header style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 24, height: 60 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>5a CIA PM - 6o BPM/I</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Controle Patrimonial</div>
        </div>
        <div style={{ width: 1, height: 30, background: 'var(--border2)' }} />
        <nav style={{ display: 'flex', gap: 4 }}>
          {abas.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)} style={{ background: aba === a.id ? 'var(--accent)' : 'transparent', color: aba === a.id ? '#fff' : 'var(--text2)', padding: '6px 16px', fontSize: 13, fontWeight: 600, border: aba === a.id ? 'none' : '1px solid transparent' }}>{a.label}</button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{usuario.nome}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{usuario.perfil}</div>
          </div>
          <button onClick={handleLogout} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>Sair</button>
        </div>
      </header>
      <main style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="fade-in" key={aba}>
          {aba === 'resumo'    && <TabResumo resumo={resumo} />}
          {aba === 'itens'     && <TabItens showToast={showToast} />}
          {aba === 'armas'     && <TabArmas showToast={showToast} />}
          {aba === 'viaturas'  && <TabViaturas showToast={showToast} />}
          {aba === 'historico' && <TabHistorico showToast={showToast} />}
          {aba === 'usuarios' && <TabUsuarios showToast={showToast} usuarioLogado={usuario} />}
        </div>
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
