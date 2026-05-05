import { useState } from 'react';

export default function Dashboard({ usuario, onLogout }) {
  const [menu, setMenu] = useState('inicio');

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
          <p style={styles.sidebarTitulo}>Patrimônio Control</p>
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
          <h2 style={styles.paginaTitulo}>
            {menuItems.find(m => m.id === menu)?.label}
          </h2>
          <span style={styles.usuarioNome}>{usuario?.nome}</span>
        </div>
        <div style={styles.main}>
          {menu === 'inicio' && (
            <div style={styles.cards}>
              <div style={styles.card}>
                <div style={styles.cardNum}>6</div>
                <div style={styles.cardLabel}>Viaturas Ativas</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardNum}>90</div>
                <div style={styles.cardLabel}>Efetivo</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardNum}>0</div>
                <div style={styles.cardLabel}>Alertas</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardNum}>0</div>
                <div style={styles.cardLabel}>Boletins Hoje</div>
              </div>
            </div>
          )}
          {menu !== 'inicio' && (
            <div style={styles.emConstrucao}>
              <p style={styles.emConstrucaoText}>Modulo em construcao</p>
              <p style={styles.emConstrucaoSub}>Em breve disponivel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#1a1a2e' },
  sidebar: { width: 240, backgroundColor: '#16213e', borderRight: '1px solid #0f3460', display: 'flex', flexDirection: 'column', padding: '20px 0' },
  sidebarHeader: { padding: '0 20px 24px', borderBottom: '1px solid #0f3460', marginBottom: 12 },
  sidebarTitulo: { color: '#ffffff', fontSize: 14, fontWeight: 700, margin: 0 },
  menuItem: { display: 'flex', alignItems: 'center', padding: '12px 20px', border: 'none', background: 'none', color: '#8892a4', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left' },
  menuItemAtivo: { backgroundColor: '#0f3460', color: '#4d9fff', borderLeft: '3px solid #4d9fff' },
  logoutBtn: { marginTop: 'auto', padding: '12px 20px', border: 'none', background: 'none', color: '#ff6b6b', fontSize: 14, cursor: 'pointer', textAlign: 'left' },
  content: { flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: { padding: '16px 24px', backgroundColor: '#16213e', borderBottom: '1px solid #0f3460', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  paginaTitulo: { color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 },
  usuarioNome: { color: '#4d9fff', fontSize: 14 },
  main: { padding: 24, flex: 1 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  card: { backgroundColor: '#16213e', borderRadius: 12, padding: 24, border: '1px solid #0f3460', textAlign: 'center' },
  cardNum: { color: '#ffffff', fontSize: 32, fontWeight: 700, marginBottom: 8 },
  cardLabel: { color: '#8892a4', fontSize: 13 },
  emConstrucao: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  emConstrucaoText: { color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 },
  emConstrucaoSub: { color: '#8892a4', fontSize: 14, marginTop: 8 },
};
