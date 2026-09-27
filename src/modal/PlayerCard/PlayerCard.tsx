import React from "react";
import styles from "./PlayerCard.module.css";

interface ICharacter {
  age: string;
  profession: string;
  health: string;
  fobia: string;
  hobbie: string;
  bandage: string;
  action: string;
  fact: string;
}

interface PlayerCardProps {
  playerName: string;
  character: ICharacter | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  character,
  loading,
  onRefresh,
}) => {
  const fields = [
    { label: "🎂 Возраст", key: "age" },
    { label: "💼 Профессия", key: "profession" },
    { label: "🏥 Здоровье", key: "health" },
    { label: "😨 Фобия", key: "fobia" },
    { label: "🎯 Хобби", key: "hobbie" },
    { label: "🎒 Вещи", key: "bandage" },
    { label: "⚡ Действие", key: "action" },
    { label: "📖 Факт", key: "fact" },
  ];

  // ✅ Загрузка
  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>🃏 Карта: {playerName}</h3>
        <div className={styles.skeletonContainer}>
          {fields.map((field, index) => (
            <div key={index} className={styles.skeletonField}>
              <span className={styles.skeletonLabel}>{field.label}</span>
              <span className={styles.skeletonValue}></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Нет карты
  if (!character) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>🃏 Карта: {playerName}</h3>
        <div className={styles.emptyState}>
          <p>❌ Карта не найдена</p>
          {onRefresh && (
            <button className={styles.refreshBtn} onClick={onRefresh}>
              🔄 Попробовать снова
            </button>
          )}
        </div>
      </div>
    );
  }

  // ✅ Есть карта
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🃏 Карта: {playerName}</h3>
      <div className={styles.cardContent}>
        {fields.map((field) => (
          <div key={field.key} className={styles.field}>
            <span className={styles.label}>{field.label}</span>
            <span className={styles.value}>
              {character[field.key as keyof ICharacter] || "❓"}
            </span>
          </div>
        ))}
        {onRefresh && (
          <button className={styles.refreshBtn} onClick={onRefresh}>
            🔄 Обновить
          </button>
        )}
      </div>
    </div>
  );
};