// Phase 2 — Layout Shell
import React from 'react';

export default function Header({ title }) {
  return (
    <div className="flex items-center px-[14px] py-[10px] border-b-[0.5px] border-[#222] text-[13px] text-[#666] w-full">
      {title}
    </div>
  );
}
