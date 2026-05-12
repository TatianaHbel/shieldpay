import { useState, useRef, useEffect } from 'react'
import { ShieldCheck, ShieldOff, SlidersHorizontal, List } from 'lucide-react'
import { Asterisk } from '@phosphor-icons/react'
import { Table, TableHeader, TableBody, TableRow, TableCell } from './Table'
import { TokenAvatar } from './TokenAvatar'

type TokenFilter = 'all' | 'shielded' | 'unshielded'

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color'

interface TokenEntry {
  symbol: string
  name: string
  imageUrl: string
  isShielded: boolean
  balance: string
  balanceUnit: string
  usd: string
}

const TOKENS: TokenEntry[] = [
  { symbol: 'ETH',   name: 'Ethereum',          imageUrl: `${ICON_BASE}/eth.png`,  isShielded: false, balance: '4.2831',   balanceUnit: 'ETH',   usd: '14,203.44' },
  { symbol: 'cETH',  name: 'Shielded Ethereum', imageUrl: `${ICON_BASE}/eth.png`,  isShielded: true,  balance: '1.5000',   balanceUnit: 'cETH',  usd: '4,975.50'  },
  { symbol: 'USDC',  name: 'USD Coin',           imageUrl: `${ICON_BASE}/usdc.png`, isShielded: false, balance: '2,500.00', balanceUnit: 'USDC',  usd: '2,500.00'  },
  { symbol: 'cUSDC', name: 'Shielded USD Coin',  imageUrl: `${ICON_BASE}/usdc.png`, isShielded: true,  balance: '1,000.00', balanceUnit: 'cUSDC', usd: '1,000.00'  },
  { symbol: 'DAI',   name: 'Dai Stablecoin',     imageUrl: `${ICON_BASE}/dai.png`,  isShielded: false, balance: '500.00',   balanceUnit: 'DAI',   usd: '500.12'    },
  { symbol: 'cDAI',  name: 'Shielded Dai',       imageUrl: `${ICON_BASE}/dai.png`,  isShielded: true,  balance: '250.00',   balanceUnit: 'cDAI',  usd: '250.06'    },
]


function PrivacyBadge({ isShielded }: { isShielded: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        background: isShielded ? 'rgba(109, 40, 217, 0.1)' : 'transparent',
        border: isShielded
          ? '1px solid rgba(109, 40, 217, 0.2)'
          : '1px solid var(--color-border)',
        fontSize: '12px',
        fontWeight: 500,
        color: isShielded ? 'var(--color-shielded)' : 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {isShielded ? (
        <ShieldCheck size={12} strokeWidth={2} aria-hidden />
      ) : (
        <ShieldOff size={12} strokeWidth={2} aria-hidden />
      )}
      {isShielded ? 'Shielded' : 'Unshielded'}
    </span>
  )
}

function MaskedAmount() {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1px',
        color: 'var(--color-text-secondary)',
      }}
    >
      <Asterisk weight="bold" size={13} />
      <Asterisk weight="bold" size={13} />
      <Asterisk weight="bold" size={13} />
    </span>
  )
}

const FILTER_OPTIONS: { value: TokenFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'all',         label: 'All',        icon: <List size={13} strokeWidth={2} aria-hidden /> },
  { value: 'shielded',   label: 'Shielded',   icon: <ShieldCheck size={13} strokeWidth={2} aria-hidden /> },
  { value: 'unshielded', label: 'Unshielded', icon: <ShieldOff size={13} strokeWidth={2} aria-hidden /> },
]

function AssetHeader({
  filter,
  onFilter,
}: {
  filter: TokenFilter
  onFilter: (f: TokenFilter) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFiltered = filter !== 'all'
  const activeLabel = FILTER_OPTIONS.find(o => o.value === filter)!.label

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          whiteSpace: 'nowrap',
        }}
      >
        Asset
      </span>

      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: isFiltered ? '2px 8px 2px 6px' : '2px 6px',
            borderRadius: 'var(--radius-full)',
            border: isFiltered ? '1px solid rgba(109, 40, 217, 0.3)' : '1px solid transparent',
            background: isFiltered ? 'rgba(109, 40, 217, 0.1)' : 'transparent',
            color: isFiltered ? 'var(--color-shielded)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
        >
          <SlidersHorizontal size={12} strokeWidth={2.5} aria-hidden />
          {isFiltered && (
            <span style={{ fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Only {activeLabel}
            </span>
          )}
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Filter by privacy"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 50,
              minWidth: '148px',
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
            }}
          >
            {FILTER_OPTIONS.map(({ value, label, icon }) => {
              const selected = filter === value
              return (
                <button
                  key={value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => { onFilter(value); setOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: selected ? 'rgba(109, 40, 217, 0.1)' : 'transparent',
                    color: selected ? 'var(--color-shielded)' : 'var(--color-text-primary)',
                    fontSize: '13px',
                    fontWeight: selected ? 600 : 400,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 100ms ease',
                  }}
                >
                  {icon}
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export interface TokenTableProps {
  hidden: boolean
}

export function TokenTable({ hidden }: TokenTableProps) {
  const [filter, setFilter] = useState<TokenFilter>('all')

  const visibleTokens = TOKENS.filter(t => {
    if (filter === 'shielded')   return t.isShielded
    if (filter === 'unshielded') return !t.isShielded
    return true
  })

  return (
    <Table bordered accessibilityLabel="Token balances">
      <TableHeader>
        <TableRow>
          <TableCell asHeader width="40%">
            <AssetHeader filter={filter} onFilter={setFilter} />
          </TableCell>
          <TableCell asHeader title="Privacy" width="25%" justifyContent="center" />
          <TableCell
            asHeader
            title="Balance"
            width="35%"
            justifyContent="flex-end"
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleTokens.map(token => (
          <TableRow key={token.symbol}>
            <TableCell
              start={
                <TokenAvatar
                  symbol={token.symbol}
                  imageUrl={token.imageUrl}
                  variant={token.isShielded ? 'shielded' : 'default'}
                />
              }
              title={token.symbol}
              subtitle={token.name}
            />
            <TableCell alignItems="center">
              <PrivacyBadge isShielded={token.isShielded} />
            </TableCell>
            <TableCell direction="row" justifyContent="flex-end" alignItems="center">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '3px',
                }}
              >
                {hidden ? (
                  <>
                    <MaskedAmount />
                    <MaskedAmount />
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: 'var(--text-small)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {token.balance} {token.balanceUnit}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      ${token.usd}
                    </span>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
