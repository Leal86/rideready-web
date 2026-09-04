import ActivityForm from '../components/ActivityForm'
import ActivityList from '../components/ActivityList'
import Header from '../components/Header'

function ActivitiesPage() {
  const activities = []

  return (
    <>
      <Header />

      <main className="app">
        <div className="app-content">
          <section>
            <h1>As minhas atividades</h1>
            <p>
              Planeie atividades ao ar livre e consulte as condições
              meteorológicas para o local escolhido.
            </p>
          </section>

          <ActivityForm />

          <ActivityList activities={activities} />
        </div>
      </main>
    </>
  )
}

export default ActivitiesPage