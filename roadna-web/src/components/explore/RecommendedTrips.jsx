import ExploreTripCard from './ExploreTripCard'
import CarouselSlider from './CarouselSlider'

export default function RecommendedTrips({ trips = [], onViewTrip, listRef }) {
  if (!trips.length) return null

  return (
    <CarouselSlider itemWidth={312} listRef={listRef}>
      {trips.map((trip, i) => (
        <div key={trip.id} data-sr-index={i} className="reveal-card w-72">
          <ExploreTripCard
            trip={trip}
            onView={() => onViewTrip?.(trip.id)}
            compact={true}
          />
        </div>
      ))}
    </CarouselSlider>
  )
}
