import React from 'react';

export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 md:w-52 rounded-xl overflow-hidden bg-[#15171B] border border-gray-800 animate-pulse">
      {/* Poster Image */}
      <div className="w-full h-64 md:h-72 bg-gray-800" />
      {/* Content */}
      <div className="p-3 space-y-3">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-gray-800 rounded w-1/4" />
          <div className="h-6 bg-gray-800 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton({ count = 5 }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8 animate-pulse">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-80 h-96 md:h-[450px] bg-gray-800 rounded-2xl flex-shrink-0" />
        {/* Info */}
        <div className="flex-1 space-y-6 py-4">
          <div className="h-8 bg-gray-800 rounded w-1/2" />
          <div className="h-4 bg-gray-800 rounded w-1/4" />
          <div className="h-4 bg-gray-800 rounded w-1/3" />
          <div className="space-y-2 pt-4">
            <div className="h-3 bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-800 rounded w-3/4" />
          </div>
          <div className="flex gap-4 pt-6">
            <div className="h-12 bg-gray-800 rounded w-32" />
            <div className="h-12 bg-gray-800 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
