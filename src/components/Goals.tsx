/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Trophy, Minus, Percent } from 'lucide-react';
import { Goal } from '../types';
import { getColorScheme, COLOR_SCHEMES } from '../utils/colorUtils';
import { Modal } from './Modal';

interface GoalsProps {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  editGoal: (id: string, updatedFields: Partial<Omit<Goal, 'id'>>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
}

export const Goals: React.FC<GoalsProps> = ({
  goals,
  addGoal,
  editGoal,
  deleteGoal,
  updateGoalProgress,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState('turquoise');

  const resetForm = () => {
    setName('');
    setDescription('');
    setProgress(0);
    setColor('turquoise');
    setEditingGoal(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setDescription(goal.description || '');
    setProgress(goal.progress);
    setColor(goal.color);
    setIsCreateOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const goalData = {
      name: name.trim(),
      description: description.trim() || undefined,
      progress: Number(progress),
      color,
    };

    if (editingGoal) {
      editGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this long-term goal?')) {
      deleteGoal(id);
      if (editingGoal?.id === id) {
        setIsCreateOpen(false);
        resetForm();
      }
    }
  };

  return (
    <div className="space-y-6" id="goals-page">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-6 pb-1" id="goals-title-section">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight" id="goals-title">
            Long-term Goals
          </h1>
          <p className="text-sm text-neutral-500 max-w-md leading-relaxed" id="goals-subtitle">
            Maintain momentum on big horizons and milestones.
          </p>
        </div>

        <button
          id="goals-add-goal-btn"
          onClick={handleOpenCreate}
          className="self-start sm:self-auto bg-turquoise-500 hover:bg-turquoise-600 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-turquoise-500/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="goals-list-grid">
        <AnimatePresence mode="popLayout">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const scheme = getColorScheme(goal.color);
              const isCompleted = goal.progress >= 100;

              return (
                <motion.div
                  id={`goal-card-${goal.id}`}
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  layout
                  className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm shadow-neutral-100 flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  {/* Subtle success ribbon background for finished goals */}
                  {isCompleted && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-4xs font-bold uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-xs" id={`goal-completed-ribbon-${goal.id}`}>
                      Done
                    </div>
                  )}

                  {/* Header Title & Theme Indicator */}
                  <div className="space-y-1.5 pr-10">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${scheme.solidBg}`} />
                      <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider">
                        {scheme.name} Milestone
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-850 leading-snug tracking-tight">
                      {goal.name}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Goal Progress Section */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                      <span>Milestone Progress</span>
                      <span className={`${scheme.text} font-bold text-sm`}>{goal.progress}%</span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden" id={`goal-progress-track-${goal.id}`}>
                      <motion.div
                        className={`h-full ${scheme.solidBg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Quick Incrementor / Decrementor controls for single-click edit */}
                    <div className="flex items-center justify-between gap-2 bg-neutral-50/60 hover:bg-neutral-50 px-3 py-2 rounded-2xl transition-all border border-neutral-100/50" id={`goal-quick-controls-${goal.id}`}>
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider pl-0.5">
                        adjust
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`goal-dec-${goal.id}`}
                          onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 5))}
                          disabled={goal.progress <= 0}
                          className="w-7 h-7 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                          title="Decrease by 5%"
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <button
                          id={`goal-inc-${goal.id}`}
                          onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 5))}
                          disabled={goal.progress >= 100}
                          className="w-7 h-7 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                          title="Increase by 5%"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center justify-end gap-1 border-t border-neutral-50 pt-3 mt-1" id={`goal-actions-${goal.id}`}>
                    <button
                      id={`goal-edit-btn-${goal.id}`}
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 text-neutral-400 hover:text-turquoise-600 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                      title="Edit Goal Details"
                    >
                      <Edit2 size={13.5} />
                    </button>
                    <button
                      id={`goal-delete-btn-${goal.id}`}
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 size={13.5} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div
              className="col-span-full text-center py-16 text-neutral-400 flex flex-col items-center justify-center gap-4 bg-neutral-50/30 rounded-3xl border border-dashed border-neutral-200"
              id="goals-empty-state"
            >
              <div className="bg-neutral-50 p-4 rounded-full text-neutral-400">
                <Trophy size={32} strokeWidth={1.5} className="text-orange-500 animate-bounce" />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-neutral-600">Track Long-term Milestones</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Connect small daily loops into large-scale accomplishments. Define parameters like studying languages, designing code templates, or training targets.
                </p>
              </div>
              <button
                id="goals-create-first-btn"
                onClick={handleOpenCreate}
                className="text-xs font-semibold bg-turquoise-500 hover:bg-turquoise-600 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm shadow-turquoise-500/10"
              >
                Create a Goal
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Goal Creation Overlay Modal */}
      <Modal
        idPrefix="goal-editor"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-5" id="goal-editor-form">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider" htmlFor="goal-name-input">
              Goal Title
            </label>
            <input
              id="goal-name-input"
              type="text"
              required
              placeholder="e.g. Learn Conversational Chinese"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5 text-neutral-800 font-semibold placeholder-neutral-400 focus:outline-hidden focus:border-turquoise-500 focus:ring-3 focus:ring-turquoise-500/10 transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider" htmlFor="goal-desc-input">
              Description / Specifics (Optional)
            </label>
            <textarea
              id="goal-desc-input"
              rows={3}
              placeholder="Detail your metrics, target days, or step-by-step strategies."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-neutral-800 font-medium placeholder-neutral-400 focus:outline-hidden focus:border-turquoise-500 focus:ring-3 focus:ring-turquoise-500/10 transition-all text-sm resize-none"
            />
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Accent Theme Color</label>
            <div className="flex gap-2.5 flex-wrap" id="goal-color-selectors">
              {Object.keys(COLOR_SCHEMES).map((colorKey) => {
                const scheme = COLOR_SCHEMES[colorKey];
                const isSelected = color === colorKey;
                return (
                  <button
                    id={`goal-color-btn-${colorKey}`}
                    key={colorKey}
                    type="button"
                    onClick={() => setColor(colorKey)}
                    className={`w-9 h-9 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'border-neutral-800 scale-108 shadow-sm' : 'border-transparent hover:scale-105'
                    } ${scheme.solidBg}`}
                    title={scheme.name}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Progress Slider (Initially 0 or editing value) */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-2" id="goal-progress-slider-panel">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 mb-1">
              <span>Initial Progress Status</span>
              <span className="text-turquoise-600 font-bold flex items-center gap-0.5">
                {progress}
                <Percent size={12} />
              </span>
            </div>
            <input
              id="goal-progress-slider-input"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-turquoise-500 cursor-pointer h-2 rounded-lg bg-neutral-200 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2" id="goal-form-actions">
            <button
              id="goal-cancel-btn"
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm py-3.5 rounded-2xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              id="goal-save-btn"
              type="submit"
              className="flex-1 bg-turquoise-500 hover:bg-turquoise-600 text-white font-semibold text-sm py-3.5 rounded-2xl transition-all shadow-sm shadow-turquoise-500/10 cursor-pointer text-center"
            >
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
