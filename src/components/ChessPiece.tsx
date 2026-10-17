import React from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
  isGolden?: boolean;
}

const PieceDefs: React.FC = () => (
  <defs>
    {/* White piece gradient - creamy ivory to soft porcelain with subtle specular lighting */}
    <linearGradient id="whitePieceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="55%" stopColor="#FAF8F5" />
      <stop offset="100%" stopColor="#E8E2D5" />
    </linearGradient>

    {/* Black piece gradient - sleek obsidian with soft metallic highlights */}
    <linearGradient id="blackPieceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#3D3731" />
      <stop offset="50%" stopColor="#25211D" />
      <stop offset="100%" stopColor="#15120F" />
    </linearGradient>

    {/* 24k Metallic Gold gradient for luxury piece lines & filigree */}
    <linearGradient id="goldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFF2A3" />
      <stop offset="35%" stopColor="#E5C158" />
      <stop offset="70%" stopColor="#B38728" />
      <stop offset="100%" stopColor="#F5C442" />
    </linearGradient>

    {/* Realistic piece drop shadow */}
    <filter id="pieceShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.45" />
    </filter>
  </defs>
);

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  className = "w-full h-full",
  isGolden = false,
}) => {
  const isWhite = color === 'w';

  // Golden outline ONLY for chessguy board theme; classic traditional styling for all other boards
  const outlineStroke = isGolden ? 'url(#goldLineGrad)' : (isWhite ? '#362B16' : '#0F0D0A');
  const outlineWidth = isGolden ? '0.7' : '1.4';
  const innerStroke = isGolden
    ? (isWhite ? '#D4CCBA' : '#3E3831')
    : (isWhite ? '#362B16' : '#E2E8F0');
  const innerWidth = isGolden ? '0.5' : '1.0';
  const detailStroke = isGolden
    ? (isWhite ? '#5A5043' : '#D1C7B7')
    : (isWhite ? '#362B16' : '#E2E8F0');
  const detailFill = isGolden
    ? (isWhite ? '#5A5043' : '#D1C7B7')
    : (isWhite ? '#362B16' : '#FFFFFF');

  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <PieceDefs />
          <g filter="url(#pieceShadow)">
            <path
              d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
              fill={isWhite ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)'}
              stroke={outlineStroke}
              strokeWidth={outlineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Subtle collar curve */}
            <path
              d="M 19,26.5 C 20.5,27.5 24.5,27.5 26,26.5"
              fill="none"
              stroke={innerStroke}
              strokeWidth={innerWidth}
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <PieceDefs />
          <g filter="url(#pieceShadow)">
            {/* Clean unified rook silhouette */}
            <path
              d="M 9,39 L 36,39 L 36,36 L 33,36 L 33,32 L 34,32 L 31,29.5 L 31,17 L 34,14 L 34,9 L 30,9 L 30,11 L 25,11 L 25,9 L 20,9 L 20,11 L 15,11 L 15,9 L 11,9 L 11,14 L 14,17 L 14,29.5 L 11,32 L 12,32 L 12,36 L 9,36 Z"
              fill={isWhite ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)'}
              stroke={outlineStroke}
              strokeWidth={outlineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Subtle internal architectural division lines */}
            <path
              d="M 12,36 L 33,36 M 14,29.5 L 31,29.5 M 14,17 L 31,17 M 11,14 L 34,14"
              fill="none"
              stroke={innerStroke}
              strokeWidth={innerWidth}
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <PieceDefs />
          <g filter="url(#pieceShadow)">
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.05,5.4 20,6.5 C 20,6.5 21.05,7.9 22,10 z"
              fill={isWhite ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)'}
              stroke={outlineStroke}
              strokeWidth={outlineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Eye */}
            <circle
              cx="9.5"
              cy="25.5"
              r="1.0"
              fill={detailFill}
            />
            {/* Nostril */}
            <path
              d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5 25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
              fill={detailFill}
            />
            {/* Subtle mane curl & jaw contours */}
            <path
              d="M 24.5,10.5 C 26,14 28,19 28,24 M 22,20 C 21,24 19,26 16,28"
              fill="none"
              stroke={innerStroke}
              strokeWidth={innerWidth}
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <PieceDefs />
          <g filter="url(#pieceShadow)">
            <g
              fill={isWhite ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)'}
              stroke={outlineStroke}
              strokeWidth={outlineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
              <path d="M 12,36 C 12,32 17,29 17,25 C 17,22 14,20 14,16 C 14,10 18,7 22.5,7 C 27,7 31,10 31,16 C 31,20 28,22 28,25 C 28,29 33,32 33,36 z" />
              <circle cx="22.5" cy="5" r="2" />
            </g>
            {/* Subtle Mitre slash cut */}
            <path
              d="M 20.5,17 C 20.5,19 24.5,19 24.5,17"
              fill="none"
              stroke={detailStroke}
              strokeWidth={isGolden ? "0.6" : "1.0"}
              strokeLinecap="round"
            />
            {/* Subtle waist band */}
            <path
              d="M 17.5,26 L 27.5,26"
              stroke={innerStroke}
              strokeWidth={innerWidth}
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <PieceDefs />
          <g filter="url(#pieceShadow)">
            <g
              fill={isWhite ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)'}
              stroke={outlineStroke}
              strokeWidth={outlineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 22.5,23.5 L 14,11 L 14,25 L 7,14 L 9,26 z" />
              <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10,36 C 9.5,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 35.5,37.5 35,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 z" />
              <circle cx="6" cy="12" r="1.8" />
              <circle cx="14" cy="9" r="1.8" />
              <circle cx="22.5" cy="8" r="1.8" />
              <circle cx="31" cy="9" r="1.8" />
              <circle cx="39" cy="12" r="1.8" />
            </g>
            {/* Subtle base band */}
            <path
              d="M 11.5,30 C 17,28.5 28,28.5 33.5,30"
              fill="none"
              stroke={innerStroke}
              strokeWidth={innerWidth}
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <PieceDefs />
          <g filter="url(#pieceShadow)">
            <g
              fill={isWhite ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)'}
              stroke={outlineStroke}
              strokeWidth={outlineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 z" />
              <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,35 37.5,30 36.5,26 C 35.5,22 32.5,20.5 30,22 C 27.5,23.5 26.5,28 22.5,28 C 18.5,28 17.5,23.5 15,22 C 12.5,20.5 9.5,22 8.5,26 C 7.5,30 8.5,35 11.5,37 z" />
              {/* Crown cross */}
              <path
                d="M 22.5,11.5 L 22.5,5 M 19.5,8 L 25.5,8"
                fill="none"
              />
            </g>
            {/* Subtle crown crease lines */}
            <path
              d="M 11.5,30 C 17,27 28,27 33.5,30 M 11.5,34 C 17,31 28,31 33.5,34"
              fill="none"
              stroke={innerStroke}
              strokeWidth={innerWidth}
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
