function ActivityForm() {
  return (
    <section className="activity-form-card">
      <div className="activity-form-card__header">
        <div>
          <span className="eyebrow">Planeamento</span>
          <h2>Nova atividade</h2>
        </div>

        <p>
          Defina o local, a data e o tipo de atividade que pretende realizar.
        </p>
      </div>

      <form className="activity-form">
        <div className="form-field form-field--full">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Ex.: Caminhada no parque"
          />
        </div>

        <div className="form-field">
          <label htmlFor="activity_type">Tipo de atividade</label>
          <select id="activity_type" name="activity_type">
            <option value="WALKING">Caminhada</option>
            <option value="RUNNING">Corrida</option>
            <option value="CYCLING">Ciclismo</option>
            <option value="HIKING">Trilho</option>
            <option value="OTHER">Outra</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="location_name">Local</label>
          <input
            id="location_name"
            name="location_name"
            type="text"
            placeholder="Ex.: Lisboa"
          />
        </div>

        <div className="form-field">
          <label htmlFor="scheduled_date">Data</label>
          <input
            id="scheduled_date"
            name="scheduled_date"
            type="date"
          />
        </div>

        <div className="form-field">
          <label htmlFor="scheduled_time">Hora</label>
          <input
            id="scheduled_time"
            name="scheduled_time"
            type="time"
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            placeholder="Informações adicionais"
          />
        </div>

        <div className="form-actions form-field--full">
          <button className="button button--primary" type="submit">
            Criar atividade
          </button>
        </div>
      </form>
    </section>
  )
}

export default ActivityForm