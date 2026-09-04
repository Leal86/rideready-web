function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        +
      </div>

      <div>
        <h3>Ainda não existem atividades</h3>
        <p>
          Crie a sua primeira atividade para começar a planear as suas aventuras
          ao ar livre.
        </p>
      </div>
    </section>
  )
}

export default EmptyState