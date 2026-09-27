import styles from "./PlayerCard.module.css";

interface PlayerCardProps {
  name?: string;
  character: {
    age: string;
    profession: string;
    health: string;
    fobia: string;
    hobbie: string;
    bandage: string;
    action: string;
    fact: string;
  };
  onGetMyCard?: () => void;
}

export const PlayerCard = ({
  name,
  character,
  onGetMyCard,
}: PlayerCardProps) => {
  const fields = [
    { label: "🎂 Возраст", value: character.age },
    { label: "💼 Профессия", value: character.profession },
    { label: "🏥 Здоровье", value: character.health },
    { label: "😨 Фобия", value: character.fobia },
    { label: "🎯 Хобби", value: character.hobbie },
    { label: "🎒 Вещи", value: character.bandage },
    { label: "⚡ Действие", value: character.action },
    { label: "📖 Факт", value: character.fact },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🃏 Моя карта</h3>
        {onGetMyCard && (
          <button className={styles.refreshBtn} onClick={onGetMyCard}>
            🔄
          </button>
        )}
      </div>
      <div className={styles.content}>
        {fields.map((field) => (
          <div key={field.label} className={styles.field}>
            <span className={styles.label}>{field.label}</span>
            <span className={field.value ? styles.value : styles.emptyValue}>
              {field.value || "❓ Скрыто"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
