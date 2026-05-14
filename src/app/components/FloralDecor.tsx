import React from "react";

interface FlowerProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PinkFlower({ size = 60, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
    >
      <g transform="translate(30,30)">
        <ellipse cx="0" cy="-14" rx="7" ry="11" fill="#E84E8A" transform="rotate(0)" />
        <ellipse cx="0" cy="-14" rx="7" ry="11" fill="#E84E8A" transform="rotate(72)" />
        <ellipse cx="0" cy="-14" rx="7" ry="11" fill="#D93D79" transform="rotate(144)" />
        <ellipse cx="0" cy="-14" rx="7" ry="11" fill="#E84E8A" transform="rotate(216)" />
        <ellipse cx="0" cy="-14" rx="7" ry="11" fill="#D93D79" transform="rotate(288)" />
        <circle cx="0" cy="0" r="9" fill="#F5C518" />
        <circle cx="0" cy="0" r="5" fill="#E8A800" />
      </g>
    </svg>
  );
}

export function YellowFlower({ size = 50, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
    >
      <g transform="translate(30,30)">
        <ellipse cx="0" cy="-14" rx="8" ry="12" fill="#F5C518" transform="rotate(0)" />
        <ellipse cx="0" cy="-14" rx="8" ry="12" fill="#F0B800" transform="rotate(90)" />
        <ellipse cx="0" cy="-14" rx="8" ry="12" fill="#F5C518" transform="rotate(180)" />
        <ellipse cx="0" cy="-14" rx="8" ry="12" fill="#F0B800" transform="rotate(270)" />
        <circle cx="0" cy="0" r="9" fill="#1DB5B5" />
        <circle cx="0" cy="0" r="5" fill="#149090" />
      </g>
    </svg>
  );
}

export function TealFlower({ size = 45, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
    >
      <g transform="translate(30,30)">
        <ellipse cx="0" cy="-13" rx="6" ry="10" fill="#1DB5B5" transform="rotate(0)" />
        <ellipse cx="0" cy="-13" rx="6" ry="10" fill="#18A0A0" transform="rotate(60)" />
        <ellipse cx="0" cy="-13" rx="6" ry="10" fill="#1DB5B5" transform="rotate(120)" />
        <ellipse cx="0" cy="-13" rx="6" ry="10" fill="#18A0A0" transform="rotate(180)" />
        <ellipse cx="0" cy="-13" rx="6" ry="10" fill="#1DB5B5" transform="rotate(240)" />
        <ellipse cx="0" cy="-13" rx="6" ry="10" fill="#18A0A0" transform="rotate(300)" />
        <circle cx="0" cy="0" r="9" fill="#F5C518" />
        <circle cx="0" cy="0" r="4" fill="#E8A800" />
      </g>
    </svg>
  );
}

export function PurpleFlower({ size = 40, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
    >
      <g transform="translate(30,30)">
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#9B59B6" transform="rotate(0)" />
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#8A4CAF" transform="rotate(72)" />
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#9B59B6" transform="rotate(144)" />
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#8A4CAF" transform="rotate(216)" />
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#9B59B6" transform="rotate(288)" />
        <circle cx="0" cy="0" r="8" fill="#F5C518" />
      </g>
    </svg>
  );
}

export function GreenFlower({ size = 44, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
    >
      <g transform="translate(30,30)">
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#3DBD6D" transform="rotate(0)" />
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#30A85C" transform="rotate(90)" />
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#3DBD6D" transform="rotate(180)" />
        <ellipse cx="0" cy="-13" rx="7" ry="11" fill="#30A85C" transform="rotate(270)" />
        <circle cx="0" cy="0" r="8" fill="#E84E8A" />
        <circle cx="0" cy="0" r="4" fill="#D93D79" />
      </g>
    </svg>
  );
}

export function TropicalLeaf({ size = 50, color = "#3DBD6D", className = "", style }: FlowerProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 50 70"
      className={className}
      style={style}
    >
      <path
        d="M25 65 C12 50 8 35 10 18 C12 8 20 2 25 5 C30 2 38 8 40 18 C42 35 38 50 25 65 Z"
        fill={color}
      />
      <path
        d="M25 65 L25 5"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function MonsteraLeaf({ size = 60, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      style={style}
    >
      <path
        d="M40 75 C20 65 5 45 8 25 C10 10 25 3 40 5 C55 3 70 10 72 25 C75 45 60 65 40 75 Z"
        fill="#3DBD6D"
      />
      <path d="M25 35 C18 35 14 28 18 22" fill="#FFF8ED" stroke="#FFF8ED" strokeWidth="0" />
      <path d="M55 35 C62 35 66 28 62 22" fill="#FFF8ED" stroke="#FFF8ED" strokeWidth="0" />
      <path d="M32 60 C24 62 20 55 24 50" fill="#FFF8ED" stroke="#FFF8ED" strokeWidth="0" />
      <path d="M48 60 C56 62 60 55 56 50" fill="#FFF8ED" stroke="#FFF8ED" strokeWidth="0" />
      <line x1="40" y1="5" x2="40" y2="75" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    </svg>
  );
}

export function FernBranch({ size = 55, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
    >
      <path
        d="M30 55 C30 40 28 30 25 20 C23 12 20 6 18 2"
        stroke="#3DBD6D"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="13" cy="14" rx="9" ry="5" fill="#30A85C" transform="rotate(-35 13 14)" />
      <ellipse cx="20" cy="26" rx="9" ry="5" fill="#3DBD6D" transform="rotate(-20 20 26)" />
      <ellipse cx="24" cy="38" rx="9" ry="5" fill="#30A85C" transform="rotate(-10 24 38)" />
      <ellipse cx="36" cy="10" rx="9" ry="5" fill="#3DBD6D" transform="rotate(35 36 10)" />
      <ellipse cx="34" cy="22" rx="9" ry="5" fill="#30A85C" transform="rotate(20 34 22)" />
      <ellipse cx="33" cy="34" rx="9" ry="5" fill="#3DBD6D" transform="rotate(10 33 34)" />
    </svg>
  );
}

export function Sparkle({ size = 20, color = "#F5C518", className = "", style }: FlowerProps & { color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <path
        d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
        fill={color}
      />
    </svg>
  );
}

export function SmallBranch({ size = 40, className = "", style }: FlowerProps) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 60 42"
      className={className}
      style={style}
    >
      <path
        d="M5 38 C15 35 25 28 35 25 C45 22 52 20 58 18"
        stroke="#3DBD6D"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="18" cy="28" rx="7" ry="4" fill="#30A85C" transform="rotate(-20 18 28)" />
      <ellipse cx="30" cy="22" rx="7" ry="4" fill="#3DBD6D" transform="rotate(-15 30 22)" />
      <ellipse cx="44" cy="18" rx="7" ry="4" fill="#30A85C" transform="rotate(-10 44 18)" />
    </svg>
  );
}
