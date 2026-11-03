// The $PRESIDENT seal (public/brand/seal.png, rendered from the brand artwork).
export default function Seal({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/seal.png" alt="" aria-hidden="true" width={size} height={size} className={className} />
  );
}
