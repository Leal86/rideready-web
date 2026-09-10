function ActivityFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    typeFilter,
    onTypeChange,
    dateFilter,
    onDateChange,
    resultCount,
    hasActiveFilters,
    onClearFilters,
}) {
    return (
        <section className="activity-filters">
            <div className="activity-filters__search">
                <label htmlFor="activity-search">
                    Procurar atividades
                </label>

                <input
                    id="activity-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Procurar por título ou local..."
                />
            </div>

            <div className="activity-filters__field">
                <label htmlFor="status-filter">
                    Estado
                </label>

                <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) => onStatusChange(event.target.value)}
                >
                    <option value="ALL">Todos</option>
                    <option value="PLANNED">Planeadas</option>
                    <option value="COMPLETED">Concluídas</option>
                    <option value="CANCELLED">Canceladas</option>
                </select>
            </div>

            <div className="activity-filters__field">
                <label htmlFor="type-filter">
                    Tipo
                </label>

                <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(event) => onTypeChange(event.target.value)}
                >
                    <option value="ALL">Todos</option>
                    <option value="WALKING">Caminhada</option>
                    <option value="RUNNING">Corrida</option>
                    <option value="CYCLING">Ciclismo</option>
                    <option value="HIKING">Trilho</option>
                    <option value="OTHER">Outro</option>
                </select>
            </div>

            <div className="activity-filters__field">
                <label htmlFor="date-filter">
                    Data
                </label>

                <select
                    id="date-filter"
                    value={dateFilter}
                    onChange={(event) => onDateChange(event.target.value)}
                >
                    <option value="ALL">Todas</option>
                    <option value="TODAY">Hoje</option>
                    <option value="NEXT_7_DAYS">Próximos 7 dias</option>
                    <option value="THIS_MONTH">Este mês</option>
                </select>
            </div>

            <div className="activity-filters__summary">
                <span>
                    {resultCount === 1
                        ? '1 atividade encontrada'
                        : `${resultCount} atividades encontradas`}
                </span>

                {hasActiveFilters && (
                    <button
                        type="button"
                        className="activity-filters__clear"
                        onClick={onClearFilters}
                    >
                        Limpar filtros
                    </button>
                )}
            </div>
        </section>
    )
}

export default ActivityFilters