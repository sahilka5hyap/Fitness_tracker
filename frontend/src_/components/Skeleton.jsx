import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Single skeleton block
export const SkeletonBlock = ({ width = '100%', height = '20px', rounded = 'rounded-lg', className = '' }) => {
  const { t } = useContext(ThemeContext);
  return (
    <div
      className={`${rounded} ${className} animate-pulse`}
      style={{
        width,
        height,
        backgroundColor: t.borderHex,
        opacity: 0.5,
      }}
    />
  );
};

// Dashboard stat card skeleton
export const StatCardSkeleton = () => {
  const { t } = useContext(ThemeContext);
  return (
    <div className="p-5 rounded-2xl border" style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
      <div className="flex justify-between items-start mb-3">
        <SkeletonBlock width="40px" height="40px" rounded="rounded-xl" />
        <SkeletonBlock width="50px" height="20px" rounded="rounded-full" />
      </div>
      <SkeletonBlock width="60px" height="32px" rounded="rounded-lg" className="mb-2" />
      <SkeletonBlock width="100px" height="16px" rounded="rounded-md" />
    </div>
  );
};

// Workout row skeleton
export const WorkoutRowSkeleton = () => {
  const { t } = useContext(ThemeContext);
  return (
    <div className="p-4 rounded-xl border flex items-center gap-4"
      style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
      <SkeletonBlock width="44px" height="44px" rounded="rounded-xl" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock width="140px" height="16px" rounded="rounded-md" />
        <SkeletonBlock width="90px"  height="12px" rounded="rounded-md" />
      </div>
      <SkeletonBlock width="60px" height="28px" rounded="rounded-lg" />
    </div>
  );
};

// Generic list skeleton — renders N rows
export const ListSkeleton = ({ rows = 4, RowComponent = WorkoutRowSkeleton }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => <RowComponent key={i} />)}
  </div>
);

// Profile page skeleton
export const ProfileSkeleton = () => {
  const { t } = useContext(ThemeContext);
  return (
    <div className="p-6 rounded-2xl border space-y-4"
      style={{ backgroundColor: t.card, borderColor: t.borderHex }}>
      <div className="flex items-center gap-4">
        <SkeletonBlock width="80px" height="80px" rounded="rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock width="150px" height="20px" rounded="rounded-md" />
          <SkeletonBlock width="200px" height="14px" rounded="rounded-md" />
        </div>
      </div>
      <SkeletonBlock width="100%" height="48px" rounded="rounded-xl" />
      <SkeletonBlock width="100%" height="48px" rounded="rounded-xl" />
      <SkeletonBlock width="60%"  height="48px" rounded="rounded-xl" />
    </div>
  );
};