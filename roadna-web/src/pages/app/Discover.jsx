import { useSearchParams } from 'react-router-dom'
import { mockTrips, mockEvents } from '../../data/mockData'

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'events' ? 'events' : 'trips'

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">All trips & events</h1>
          <p className="text-sm text-gray-500">Frontend mock list, ready for backend integration.</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSearchParams({ tab: 'trips' })}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'trips'
                  ? 'bg-[#2F80ED] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Trips
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'events' })}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'events'
                  ? 'bg-[#2F80ED] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Events
            </button>
          </div>
        </section>

        <section className={activeTab === 'trips' ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Trips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockTrips.map((trip) => (
              <article key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <img src={trip.image} alt={trip.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-800">{trip.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">📍 {trip.location}</p>
                  <p className="text-xs text-gray-500">⏱ {trip.duration}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={activeTab === 'events' ? 'block' : 'hidden'}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockEvents.map((event) => (
              <article key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-800">{event.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                  <p className="text-xs text-gray-500">📅 {event.date}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
