function Header({
  activeSection,
  onSectionChange,
}) {
  return (
    <header className="site-header">
      <div className="site-header__content">
        <div className="site-header__brand">
          <span className="site-header__title">
            RideReady
          </span>

          <span className="site-header__subtitle">
            Planeie as suas atividades ao ar livre.
          </span>
        </div>

        <nav
          className="site-header__navigation"
          aria-label="Navegação principal"
        >
          <button
            type="button"
            className={
              activeSection === 'dashboard'
                ? 'site-header__nav-button site-header__nav-button--active'
                : 'site-header__nav-button'
            }
            onClick={() => onSectionChange('dashboard')}
          >
            Visão geral
          </button>

          <button
            type="button"
            className={
              activeSection === 'activities'
                ? 'site-header__nav-button site-header__nav-button--active'
                : 'site-header__nav-button'
            }
            onClick={() => onSectionChange('activities')}
          >
            Atividades
          </button>

          <button
            type="button"
            className={
              activeSection === 'calendar'
                ? 'site-header__nav-button site-header__nav-button--active'
                : 'site-header__nav-button'
            }
            onClick={() => onSectionChange('calendar')}
          >
            Calendário
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header