# Product

## Register

product

## Users

DeFi-literate users who understand wallets and token balances but should not need to understand FHE, gas mechanics, or coprocessors. They are moving real (simulated) funds between a public wallet balance and an encrypted private balance. The primary anxiety is fund safety during multi-phase operations where the system is doing invisible work after the user has already signed.

## Product Purpose

ShieldPay is a confidential DeFi prototype built on fhEVM (Fully Homomorphic Encryption). Users shield funds from a public balance into an encrypted private balance, and unshield them back. The shield operation has two async phases after signing: on-chain confirmation (visible on Etherscan as "Success") and FHE finalization (coprocessor computation, 1-3 min after confirmation). The prototype is frontend-only; all blockchain operations are simulated. Submission for Zama UX Design Challenge.

## Brand Personality

Trustworthy, precise, restrained. The product handles money; every design decision reinforces competence and transparency. Coinbase is the reference: crypto-native but accessible, bridges technical and non-technical users, earns trust through visual restraint and precision.

## Anti-references

2017-era DeFi aesthetics: no neon greens, no aggressive gradients, no dark-and-glowing UI, no motion for motion's sake. No hero-metric templates, no gradient text, no glassmorphism for decoration.

## Design Principles

1. **Clarity over cleverness.** Every state communicates what is happening, what the user should do (or "nothing, you can leave"), and what happens if they leave. No ambiguity.
2. **System phases, not user steps.** The PhaseIndicator shows what the system is doing; users are passengers, not operators. Never present async system work as a multi-step form wizard.
3. **Financial weight.** Balances, amounts, and status changes are treated with visual gravity. No casual microcopy around fund movements.
4. **Earned motion.** Animations communicate state transitions (Framer Motion, spring easing), not decoration. Looping or aggressive motion is off-brand.
5. **Component discipline.** The design system is the source of truth. Every visual decision lives in a component; screens assemble, they do not style.

## Accessibility & Inclusion

WCAG AA minimum. Light mode only for delivery. Keyboard-navigable, screen-reader-announced. 44px minimum touch targets. Never convey information through color alone.
