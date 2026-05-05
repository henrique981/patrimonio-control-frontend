import { useState, useEffect } from 'react';
import pmesp from '../assets/pmesp.png';
import bpmi from '../assets/6bpmi.png';

export default function Dashboard({ usuario, onLogout }) {
  const [menu, setMenu] = useState('inicio');
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2,'0');
      const m = String(now.getMinutes()).padStart(2,'0');
      const s = String(now.getSeconds()).padStart(2,'0');
      const d = String(now.getDate()).padStart(2,'0');
      const mo = String(now.getMonth()+1).padStart(2,'0');
      const y = now.getFullYear();
      setHora(`${h}:${m}:${s}`);
      setData(`${d}/${mo}/${y}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'boletim', label: 'Boletim do Dia' },
    { id: 'viaturas', label: 'Viaturas' },
    { id: 'materiais', label: 'Materiais' },
    { id: 'policiais', label: 'Policiais' },
    { id: 'relatorios', label: 'Relatorios' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <p style={styles.sidebarTitulo}>Patrimonio Control</p>
          <p style={styles.sidebarSub}>6 BPM/I Santos</p>
        </div>
        {menuItems.map(item => (
          <button
            key={item.id}
            style={{ ...styles.menuItem, ...(menu === item.id ? styles.menuItemAtivo : {}) }}
            onClick={() => setMenu(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button style={styles.logoutBtn} onClick={onLogout}>Sair</button>
      </div>

      <div style={styles.content}>
        <div style={styles.topbar}>
          <img src={pmesp} alt="PMESP" style={styles.logo} />
          <div style={styles.topbarCenter}>
            <div style={styles.topbarTitulo}>6 BPM/I Santos</div>
            <div style={styles.topbarSub}>Controle de Frota — Cod OPM 606065000</div>
            <div style={styles.topbarHora}>{hora}</div>
            <div style={styles.topbarData}>{data}</div>
          </div>
          <img src={bpmi} alt="6BPM/I" style={styles.logo} />
        </div>

        <div style={styles.main}>
          {menu === 'inicio' && (
            <>
              <div style={styles.cards}>
                <div style={{...styles.card, borderTop: '3px solid #2ecc71'}}>
                  <div style={{...styles.cardNum, color: '#2ecc71'}}>18</div>
                  <div style={styles.cardLabel}>Operacional</div>
                </div>
                <div style={{...styles.card, borderTop: '3px solid #cc0000'}}>
                  <div style={{...styles.cardNum, color: '#cc0000'}}>3</div>
                  <div style={styles.cardLabel}>Em Manutencao</div>
                </div>
                <div style={{...styles.card, borderTop: '3px solid #f39c12'}}>
                  <div style={{...styles.cardNum, color: '#f39c12'}}>4</div>
                  <div style={styles.cardLabel}>Alertas</div>
                </div>
                <div style={{...styles.card, borderTop: '3px solid #888'}}>
                  <div style={{...styles.cardNum, color: '#aaa'}}>2</div>
                  <div style={styles.cardLabel}>Aguard. Liberacao</div>
                </div>
              </div>

              <div style={styles.sectionTitle}>Viaturas Operacionais — Tempo Real</div>
              <div style={styles.vtrList}>
                {[
                  { prefix: 'I-06500', modelo: 'Spin 2022', policial: 'Sd Joao Silva RE 123456', km: '48.732', hora: '06h00', status: 'ok' },
                  { prefix: 'I-06510', modelo: 'Spin 2024', policial: 'Cb Carlos Lima RE 654321', km: '50.120', hora: '06h00', status: 'oleo' },
                  { prefix: 'I-06520', modelo: 'Duster 2025', policial: 'Sd Maria Souza RE 789012', km: '21.450', hora: '14h00', status: 'ok' },
                  { prefix: 'I-06534', modelo: 'Spin 2022', policial: 'Sd Pedro Costa RE 345678', km: '67.230', hora: '14h00', status: 'ok' },
                  { prefix: 'I-06535', modelo: 'Spin 2022', policial: 'Sd Ana Paula RE 901234', km: '15.890', hora: '14h00', status: 'ok' },
                  { prefix: 'I-06588', modelo: 'Yamaha 2023', policial: 'EM MANUTENCAO', km: '12.300', hora: '03/05', status: 'manut' },
                ].map((v, i) => (
                  <div key={i} style={styles.vtrRow}>
                    <div style={{...styles.dot, background: v.status === 'manut' ? '#cc0000' : v.status === 'oleo' ? '#f39c12' : '#2ecc71', boxShadow: `0 0 6px ${v.status === 'manut' ? '#cc0000' : v.status === 'oleo' ? '#f39c12' : '#2ecc71'}`}}></div>
                    <div style={styles.vtrPrefix}>{v.prefix}</div>
                    <div style={styles.vtrModelo}>{v.modelo}</div>
                    <div style={styles.vtrPolicial}>{v.policial}</div>
                    <div style={styles.vtrKm}>{v.km} km</div>
                    <div style={styles.vtrHora}>Saiu {v.hora}</div>
                    <div style={{...styles.badge, ...(v.status === 'ok' ? styles.badgeOk : v.status === 'oleo' ? styles.badgeOleo : styles.badgeManut)}}>
                      {v.status === 'ok' ? 'OK' : v.status === 'oleo' ? 'OLEO' : 'MANUT.'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {menu !== 'inicio' && (
            <div style={styles.emConstrucao}>
              <p style={styles.emConstrucaoText}>Modulo em construcao</p>
              <p style={styles.emConstrucaoSub}>Em breve disponivel</p>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <span style={styles.footerTxt}>PMESP — 6 BPM/I — TEN CEL PEDRO ARBUES — 29-XII-1896</span>
          <span style={styles.footerBadge}>SISTEMA DE CONTROLE PATRIMONIAL</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#1a1a1a' },
  sidebar: { width: 220, backgroundColor: '#111', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', padding: '16px 0' },
  sidebarHeader: { padding: '0 16px 16px', borderBottom: '1px solid #333', marginBottom: 8 },
  sidebarTitulo: { color: '#fff', fontSize: 13, fontWeight: 700, margin: 0 },
  sidebarSub: { color: '#cc0000', fontSize: 11, margin: '4px 0 0' },
  menuItem: { display: 'flex', alignItems: 'center', padding: '11px 16px', border: 'none', background: 'none', color: '#888', fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left' },
  menuItemAtivo: { backgroundColor: '#1a1a1a', color: '#fff', borderLeft: '3px solid #cc0000' },
  logoutBtn: { marginTop: 'auto', padding: '11px 16px', border: 'none', background: 'none', color: '#cc0000', fontSize: 13, cursor: 'pointer', textAlign: 'left' },
  content: { flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: { padding: '10px 20px', backgroundColor: '#111', borderBottom: '3px solid #cc0000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { height: 54, width: 'auto' },
  topbarCenter: { textAlign: 'center' },
  topbarTitulo: { color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' },
  topbarSub: { color: '#888', fontSize: 11, marginTop: 2 },
  topbarHora: { color: '#cc0000', fontSize: 22, fontWeight: 700, fontFamily: 'Courier New, monospace', marginTop: 4 },
  topbarData: { color: '#666', fontSize: 11 },
  main: { padding: 16, flex: 1, overflowY: 'auto' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 },
  card: { backgroundColor: '#222', border: '1px solid #333', borderRadius: 6, padding: 14, textAlign: 'center' },
  cardNum: { fontSize: 30, fontWeight: 700, lineHeight: 1 },
  cardLabel: { color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  sectionTitle: { color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, borderBottom: '1px solid #333', paddingBottom: 6, marginBottom: 8 },
  vtrList: { display: 'flex', flexDirection: 'column', gap: 4 },
  vtrRow: { backgroundColor: '#222', border: '1px solid #2a2a2a', borderRadius: 4, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  vtrPrefix: { color: '#fff', fontSize: 13, fontWeight: 700, minWidth: 70, fontFamily: 'Courier New, monospace' },
  vtrModelo: { color: '#888', fontSize: 11, minWidth: 90 },
  vtrPolicial: { color: '#ccc', fontSize: 12, flex: 1 },
  vtrKm: { color: '#888', fontSize: 11, fontFamily: 'Courier New, monospace', minWidth: 80, textAlign: 'right' },
  vtrHora: { color: '#666', fontSize: 10, minWidth: 60, textAlign: 'right' },
  badge: { fontSize: 10, padding: '2px 6px', borderRadius: 3, fontWeight: 700 },
  badgeOk: { background: '#0d2d1a', color: '#2ecc71', border: '1px solid #2ecc71' },
  badgeOleo: { background: '#3d1f00', color: '#f39c12', border: '1px solid #f39c12' },
  badgeManut: { background: '#3d0000', color: '#cc0000', border: '1px solid #cc0000' },
  emConstrucao: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  emConstrucaoText: { color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 },
  emConstrucaoSub: { color: '#888', fontSize: 14, marginTop: 8 },
  footer: { backgroundColor: '#111', borderTop: '1px solid #333', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerTxt: { color: '#555', fontSize: 10, letterSpacing: 1 },
  footerBadge: { color: '#cc0000', fontSize: 10, fontWeight: 700, letterSpacing: 2 },
};
