import type { CSSProperties } from 'react'
import {
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Zap,
  ArrowRight,
  Plus,
  Ban,
  Check,
} from 'lucide-react'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'

// Token brand colors — fallback background when CDN image fails
const TOKEN_COLORS: Record<string, string> = {
  ETH:   '#396993',
  AVAX:  '#DE0000',
  USDC:  '#2775CA',
  DAI:   '#F5AC37',
  BTC:   '#F7931A',
  MATIC: '#8247E5',
  SOL:   '#9945FF',
  BNB:   '#F3BA2F',
  WBTC:  '#F7931A',
  LINK:  '#2A5ADA',
  UNI:   '#FF007A',
  AAVE:  '#B6509E',
}

// Badge fills — all sourced from Figma "Token + Chain" component set
const BADGE = {
  blue:   '#3748FF',
  green:  '#5FC578',
  amber:  '#FFB74D',
  grey:   '#A8AFB7',
  greyIcon: '#4F5760',
} as const

export type TokenAvatarVariant =
  | 'default'           // chain logo badge
  | 'shielded'          // blue + ShieldCheck
  | 'unshielded'        // blue + ShieldOff
  | 'in-progress'       // blue + Zap
  | 'warning'           // amber + ShieldAlert
  | 'send-in-progress'  // blue + ArrowRight
  | 'send-success'      // green + ArrowRight
  | 'success'           // green + Check
  | 'add-funds'         // blue + Plus
  | 'failed'            // grey + Ban
  | 'pair'              // two overlapping circles

export interface TokenAvatarProps {
  /** Token symbol, e.g. "ETH", "USDC" */
  symbol: string
  /** Override for the token image URL */
  imageUrl?: string
  /** Chain symbol for the "default" variant badge, e.g. "ETH", "AVAX" */
  chain?: string
  /** Override image URL for the chain badge */
  chainImageUrl?: string
  /** Second token symbol for the "pair" variant */
  pairSymbol?: string
  /** Override image URL for the second token in the "pair" variant */
  pairImageUrl?: string
  /** sm = 32px token / 16px badge · md = 48px token / 24px badge (default) */
  size?: 'sm' | 'md'
  variant?: TokenAvatarVariant
}

// ─── Size scale ────────────────────────────────────────────
const SIZES = {
  sm: { token: 32, badge: 16, icon: 10, offset: { right: -4, bottom: -3 } },
  md: { token: 48, badge: 24, icon: 14, offset: { right: -6, bottom: -4 } },
} as const

function fallbackColor(symbol: string): string {
  return TOKEN_COLORS[symbol.toUpperCase()] ?? '#A8AFB7'
}

function resolveImageUrl(symbol: string, override?: string): string {
  return override ?? `${ICON_BASE}/${symbol.toLowerCase()}.png`
}

// ─── TokenCircle ───────────────────────────────────────────
function TokenCircle({
  symbol,
  imageUrl,
  px,
  style,
}: {
  symbol: string
  imageUrl?: string
  px: number
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        background: fallbackColor(symbol),
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={resolveImageUrl(symbol, imageUrl)}
        alt={symbol}
        width={px}
        height={px}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    </div>
  )
}

// ─── BadgeShell ────────────────────────────────────────────
// White box-shadow ring separates the badge from the token circle,
// matching the Figma white stroke between badge and main circle.
function BadgeShell({
  px,
  fill,
  offset,
  children,
}: {
  px: number
  fill: string
  offset: { right: number; bottom: number }
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        right: offset.right,
        bottom: offset.bottom,
        width: px,
        height: px,
        borderRadius: '50%',
        background: fill,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 2px #fff',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

// ─── TokenAvatar ───────────────────────────────────────────
export function TokenAvatar({
  symbol,
  imageUrl,
  chain,
  chainImageUrl,
  pairSymbol,
  pairImageUrl,
  size = 'md',
  variant = 'default',
}: TokenAvatarProps) {
  const { token: tokenPx, badge: badgePx, icon: iconPx, offset } = SIZES[size]

  if (variant === 'pair') {
    const overlap = Math.round(tokenPx * 0.4)
    const totalW = tokenPx * 2 - overlap
    return (
      <div
        style={{
          position: 'relative',
          width: totalW,
          height: tokenPx,
          flexShrink: 0,
          display: 'inline-block',
        }}
      >
        <div style={{ position: 'absolute', left: 0 }}>
          <TokenCircle symbol={symbol} imageUrl={imageUrl} px={tokenPx} />
        </div>
        <div style={{ position: 'absolute', left: tokenPx - overlap }}>
          <TokenCircle
            symbol={pairSymbol ?? symbol}
            imageUrl={pairImageUrl}
            px={tokenPx}
            style={{ boxShadow: '0 0 0 2px #fff' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <TokenCircle symbol={symbol} imageUrl={imageUrl} px={tokenPx} />

      {/* Default: chain logo */}
      {variant === 'default' && chain && (
        <BadgeShell px={badgePx} fill="#fff" offset={offset}>
          <img
            src={resolveImageUrl(chain, chainImageUrl)}
            alt={chain}
            width={badgePx}
            height={badgePx}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block',
            }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </BadgeShell>
      )}

      {/* Shielded: blue + ShieldCheck */}
      {variant === 'shielded' && (
        <BadgeShell px={badgePx} fill={BADGE.blue} offset={offset}>
          <ShieldCheck size={iconPx} color="#fff" strokeWidth={2.5} aria-hidden />
        </BadgeShell>
      )}

      {/* Unshielded: blue + ShieldOff */}
      {variant === 'unshielded' && (
        <BadgeShell px={badgePx} fill={BADGE.blue} offset={offset}>
          <ShieldOff size={iconPx} color="#fff" strokeWidth={2.5} aria-hidden />
        </BadgeShell>
      )}

      {/* In progress: blue + Zap */}
      {variant === 'in-progress' && (
        <BadgeShell px={badgePx} fill={BADGE.blue} offset={offset}>
          <Zap size={iconPx} color="#fff" strokeWidth={2.5} fill="#fff" aria-hidden />
        </BadgeShell>
      )}

      {/* Shielding warning: amber + ShieldAlert */}
      {variant === 'warning' && (
        <BadgeShell px={badgePx} fill={BADGE.amber} offset={offset}>
          <ShieldAlert size={iconPx} color="#fff" strokeWidth={2.5} aria-hidden />
        </BadgeShell>
      )}

      {/* Send in progress: blue + ArrowRight */}
      {variant === 'send-in-progress' && (
        <BadgeShell px={badgePx} fill={BADGE.blue} offset={offset}>
          <ArrowRight size={iconPx} color="#fff" strokeWidth={2.5} aria-hidden />
        </BadgeShell>
      )}

      {/* Send success: green + ArrowRight */}
      {variant === 'send-success' && (
        <BadgeShell px={badgePx} fill={BADGE.green} offset={offset}>
          <ArrowRight size={iconPx} color="#fff" strokeWidth={2.5} aria-hidden />
        </BadgeShell>
      )}

      {/* Success: green + Check */}
      {variant === 'success' && (
        <BadgeShell px={badgePx} fill={BADGE.green} offset={offset}>
          <Check size={iconPx} color="#fff" strokeWidth={2.5} aria-hidden />
        </BadgeShell>
      )}

      {/* Add funds: blue + Plus */}
      {variant === 'add-funds' && (
        <BadgeShell px={badgePx} fill={BADGE.blue} offset={offset}>
          <Plus size={iconPx} color="#fff" strokeWidth={2.5} aria-hidden />
        </BadgeShell>
      )}

      {/* Failed: grey + Ban */}
      {variant === 'failed' && (
        <BadgeShell px={badgePx} fill={BADGE.grey} offset={offset}>
          <Ban size={iconPx} color={BADGE.greyIcon} strokeWidth={2} aria-hidden />
        </BadgeShell>
      )}
    </div>
  )
}
