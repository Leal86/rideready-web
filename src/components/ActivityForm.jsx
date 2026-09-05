import { useState } from 'react'

const initialForm = {
  title: '',
  activity_type: 'WALKING',
  location_name: '',
  scheduled_date: '',
  scheduled_time: '',
  notes: '',
}

function ActivityForm({
  onCreate,
  onUpdate,
  isSubmitting,
  editingActivity,
  formDataToEdit,
  onCancelEdit,
}) {
  const [formData, setFormData] = useState(
    formDataToEdit ?? initialForm,
  )

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      ...formData,
      notes: formData.notes || null,
    }

    if (editingActivity) {
      await onUpdate(editingActivity.id, payload)
      return
    }

    const created = await onCreate(payload)

    if (created) {
      setFormData(initialForm)
    }
  }

  return (
    <section className="activity-form-card">
      <div className="activity-form-card__header">
        <div>
          <span className="eyebrow">Planeamento</span>
          <h2>
            {editingActivity ? 'Editar atividade' : 'Nova atividade'}
          </h2>
        </div>

        <p>
          Defina o local, a data e o tipo de atividade que pretende realizar.
        </p>
      </div>

      <form className="activity-form" onSubmit={handleSubmit}>
        <div className="form-field form-field--full">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex.: Caminhada no parque"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="activity_type">Tipo de atividade</label>
          <select
            id="activity_type"
            name="activity_type"
            value={formData.activity_type}
            onChange={handleChange}
          >
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
            value={formData.location_name}
            onChange={handleChange}
            placeholder="Ex.: Lisboa"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="scheduled_date">Data</label>
          <input
            id="scheduled_date"
            name="scheduled_date"
            type="date"
            value={formData.scheduled_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="scheduled_time">Hora</label>
          <input
            id="scheduled_time"
            name="scheduled_time"
            type="time"
            value={formData.scheduled_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Informações adicionais"
          />
        </div>

        <div className="form-actions form-field--full">
          {editingActivity && (
            <button
              className="button"
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}

          <button
            className="button button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'A guardar...'
              : editingActivity
                ? 'Guardar alterações'
                : 'Criar atividade'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ActivityForm