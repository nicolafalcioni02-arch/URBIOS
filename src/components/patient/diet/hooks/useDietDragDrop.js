import { useState } from 'react';

// Drag & drop di giorni e pasti nella sidebar
export const useDietDragDrop = ({ setDietDays }) => {
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [matrixDragId, setMatrixDragId] = useState(null);
    const [matrixDragOverId, setMatrixDragOverId] = useState(null);

    const handleDragStart = (e, type, itemData) => {
        e.stopPropagation();
        setDraggedItem({ type, ...itemData });
        setTimeout(() => {
            e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.preventDefault();
        e.target.style.opacity = '1';
        setDraggedItem(null);
        setDragOverId(null);
    };

    const handleDragOver = (e, targetType, targetId) => {
        e.preventDefault();
        if (draggedItem?.type === 'day' && targetType === 'meal') return;
        e.stopPropagation();
        if (dragOverId !== targetId) setDragOverId(targetId);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOverId(null);
    };

    const handleDrop = (e, targetType, targetData) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverId(null);

        if (!draggedItem) return;

        setDietDays((prev) => {
            const newDietDays = JSON.parse(JSON.stringify(prev));

            if (draggedItem.type === 'day') {
                const dropDayId = targetType === 'meal' ? targetData.dayId : targetData.dayId;
                const dragIdx = newDietDays.findIndex((d) => d.id === draggedItem.dayId);
                const dropIdx = newDietDays.findIndex((d) => d.id === dropDayId);
                if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return prev;
                const [movedDay] = newDietDays.splice(dragIdx, 1);
                newDietDays.splice(dropIdx, 0, movedDay);
            } else if (draggedItem.type === 'meal') {
                const sourceDayIdx = newDietDays.findIndex((d) => d.id === draggedItem.dayId);
                if (sourceDayIdx === -1) return prev;
                const sourceDay = newDietDays[sourceDayIdx];
                const dragIdx = sourceDay.meals.findIndex((m) => m.id === draggedItem.mealId);
                if (dragIdx === -1) return prev;

                if (targetType === 'meal') {
                    const targetDayIdx = newDietDays.findIndex((d) => d.id === targetData.dayId);
                    if (targetDayIdx === -1) return prev;
                    const targetDay = newDietDays[targetDayIdx];
                    const dropIdx = targetDay.meals.findIndex((m) => m.id === targetData.mealId);
                    if (draggedItem.dayId === targetData.dayId && dragIdx === dropIdx) return prev;
                    const [movedMeal] = sourceDay.meals.splice(dragIdx, 1);
                    targetDay.meals.splice(dropIdx, 0, movedMeal);
                } else if (targetType === 'day') {
                    if (draggedItem.dayId === targetData.dayId) return prev;
                    const targetDayIdx = newDietDays.findIndex((d) => d.id === targetData.dayId);
                    if (targetDayIdx === -1) return prev;
                    const [movedMeal] = sourceDay.meals.splice(dragIdx, 1);
                    newDietDays[targetDayIdx].meals.push(movedMeal);
                }
            }
            return newDietDays;
        });
        setDraggedItem(null);
    };

    return {
        dragOverId,
        setDragOverId,
        matrixDragId,
        setMatrixDragId,
        matrixDragOverId,
        setMatrixDragOverId,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
    };
};
