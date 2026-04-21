// Profile / Settings — iOS grouped list

function ProfileScreen({ theme, setTheme, onBack, onSignOut, onOnboard }) {
  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'

  return (
    <div>
      <NavBar title="Perfil" onBack={onBack}/>
      <div style={{ padding: '0 0 24px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.2px', padding: '8px 20px 20px' }}>Perfil</div>

        {/* Identity card */}
        <div style={{ margin: '0 16px 24px', background: 'var(--bgElev)', borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${A.blue[tone]}, ${A.purple[tone]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px',
          }}>{MOCK.user.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.4px' }}>{MOCK.user.name}</div>
            <div style={{ fontSize: 14, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>{MOCK.user.email}</div>
          </div>
          <Icon.chevR size={18} style={{ color: 'var(--textTer)' }}/>
        </div>

        {/* Preferences */}
        <Group title="Preferencias">
          <Row icon={p=><Icon.moon {...p}/>} iconBg={A.indigo[tone]} title="Apariencia"
               right={<Segmented value={theme} onChange={setTheme} options={[
                 {value:'light', label:'Claro'}, {value:'dark', label:'Oscuro'},
               ]}/>} first last/>
        </Group>

        <Group title="Cuenta">
          <Row icon={p=><Icon.person {...p}/>} iconBg={A.blue[tone]}     title="Mi perfil"     onClick={()=>{}} first/>
          <Row icon={p=><Icon.bell {...p}/>}   iconBg={A.red[tone]}      title="Notificaciones" subtitle="Alertas y recordatorios" onClick={()=>{}}/>
          <Row icon={p=><Icon.faceid {...p}/>} iconBg={A.green[tone]}    title="Face ID"       value="Activado" valueColor="var(--green)" onClick={()=>{}}/>
          <Row icon={p=><Icon.lock {...p}/>}   iconBg={A.brown[tone]}    title="Privacidad"    onClick={()=>{}} last/>
        </Group>

        <Group title="Datos">
          <Row icon={p=><Icon.cloud {...p}/>}     iconBg={A.teal[tone]}   title="Sincronización" value="iCloud" onClick={()=>{}} first/>
          <Row icon={p=><Icon.download {...p}/>}  iconBg={A.mint[tone]}   title="Exportar a CSV" onClick={()=>{}}/>
          <Row icon={p=><Icon.tag {...p}/>}       iconBg={A.orange[tone]} title="Moneda"         value="MXN · Peso mexicano" onClick={()=>{}} last/>
        </Group>

        <Group title="Soporte">
          <Row icon={p=><Icon.sparkle {...p}/>} iconBg={A.yellow[tone]} title="Ver tour otra vez" onClick={onOnboard} first/>
          <Row icon={p=><Icon.info {...p}/>}    iconBg={A.indigo[tone]} title="Ayuda y soporte" onClick={()=>{}}/>
          <Row icon={p=><Icon.heart {...p}/>}   iconBg={A.pink[tone]}   title="Califica la app" onClick={()=>{}} last/>
        </Group>

        <Group>
          <Row icon={p=><Icon.logout {...p}/>} iconBg="var(--fill)" title="Cerrar sesión" danger onClick={onSignOut} first last/>
        </Group>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--textTer)', padding: '8px 20px 0', letterSpacing: '-0.1px' }}>
          Finanzas · v2.0 (26)
        </div>
      </div>
    </div>
  )
}

Object.assign(window, { ProfileScreen })
