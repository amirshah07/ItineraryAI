import styles from './DataBlock.module.css';

export default function DataBlock({ data }) {
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  if (!data || !data.days) {
    return <p>No itinerary data available</p>; // Provide a fallback message if data is missing
  }
  return (
    <div className={styles.container}>
      {data.days.map((day) => (
        <div 
          key={day.date} 
          className={styles.dayCard}
        >
          <h3 className={styles.dayHeader}>
            {formatDate(day.date)}
          </h3>
          <div className={styles.gridContainer}>
            {day.activities.map((activity) => (
              <div
                key={activity.id}
                className={styles.activityCard}
              >
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={styles.activityName}>
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${activity.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#646cff] hover:text-[#535bf2]"
                    >
                      {activity.name}
                    </a>
                  </h3>
                </div>
                <div className={styles.activityInfo}>
                  <strong>Time:</strong> {formatTime(activity.start)} •{" "}
                  <strong>Duration:</strong> {activity.duration}
                </div>
                <div className={styles.activityType}>
                  <strong>Type:</strong>{" "}
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
