import SectionHeader from './SectionHeader'

export default function UpcomingSection({ upcoming = [] }) {
  if (!upcoming.length) return null

  return (
    <section id="upcoming" className="mb-12">
      <SectionHeader
        title="Upcoming Near You"
        subtitle="Upcoming trips and events based on your profile"
        iconUrl="https://api.iconify.design/solar/calendar-mark-bold-duotone.svg?color=%232F80ED"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcoming.map((item) => (
          <article key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <img src={item.image} alt={item.title} className="w-full h-28 object-cover rounded-xl mb-2" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0f7ff] text-[#2F80ED] font-semibold">
              {item.type}
            </span>
            <h4 className="font-semibold text-sm text-gray-800 mt-2 line-clamp-2">{item.title}</h4>
            <p className="text-xs text-gray-500 mt-1">📍 {item.location}</p>
            <p className="text-xs text-gray-500">📅 {item.date}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
