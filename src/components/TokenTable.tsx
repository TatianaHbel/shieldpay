import { ShieldCheck, ShieldOff } from 'lucide-react'
import { Asterisk } from '@phosphor-icons/react'
import { Table, TableHeader, TableBody, TableRow, TableCell } from './Table'

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

function TokenAvatar({
  imageUrl,
  symbol,
  isShielded,
}: {
  imageUrl: string
  symbol: string
  isShielded: boolean
}) {
  return (
    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
      <img
        src={imageUrl}
        alt={symbol}
        width={48}
        height={48}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
          transform: isShielded ? 'scale(0.82)' : undefined,
        }}
      />

      {isShielded && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid var(--color-shielded)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'var(--color-shielded)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-surface-raised)',
            }}
          >
            <ShieldCheck size={12} color="#fff" strokeWidth={2.5} aria-hidden />
          </div>
        </>
      )}
    </div>
  )
}

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

export interface TokenTableProps {
  hidden: boolean
}

export function TokenTable({ hidden }: TokenTableProps) {
  return (
    <Table bordered accessibilityLabel="Token balances">
      <TableHeader>
        <TableRow>
          <TableCell asHeader title="Asset" width="40%" />
          <TableCell asHeader title="Privacy" width="25%" />
          <TableCell
            asHeader
            title="Balance"
            width="35%"
            justifyContent="flex-end"
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {TOKENS.map(token => (
          <TableRow key={token.symbol}>
            <TableCell
              start={
                <TokenAvatar
                  imageUrl={token.imageUrl}
                  symbol={token.symbol}
                  isShielded={token.isShielded}
                />
              }
              title={token.symbol}
              subtitle={token.name}
            />
            <TableCell>
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
