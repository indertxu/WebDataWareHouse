// Cubo de Next: el mismo SVG que Next Reporting (mismas caras, barras y animaciones).
export function Cube({ size = 36 }) {
  return (
    <svg className="nd-cube" width={size} height={size} viewBox="10 10 100 100" aria-hidden="true">
      <g className="f f-top">
        <g transform="matrix(1,0.5,-1,0.5,60,17)">
          <rect width="38" height="38" rx="2" fill="#86efc0" />
          <polyline className="trend" points="7,30 15,19 22,24 31.7,10.1" pathLength="1" fill="none" stroke="#0a6f4d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <polygon className="tip" points="36,4 35.1,12.5 28.2,7.7" fill="#0a6f4d" />
        </g>
      </g>
      <g className="f f-left">
        <g transform="translate(16,47) skewY(26.565)">
          <rect width="38" height="40" rx="2" fill="#12b57f" />
          <text x="19" y="30" textAnchor="middle" fill="#ffffff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="27">N</text>
        </g>
      </g>
      <g className="f f-right">
        <g transform="translate(66,66) skewY(-26.565)">
          <rect width="38" height="40" rx="2" fill="#0a6f4d" />
          <rect className="bar b1" x="6" y="24" width="6" height="11" rx="1.5" fill="#ffffff" />
          <rect className="bar b2" x="16" y="16" width="6" height="19" rx="1.5" fill="#ffffff" />
          <rect className="bar b3" x="26" y="8" width="6" height="27" rx="1.5" fill="#ffffff" />
        </g>
      </g>
    </svg>
  )
}

export default function Logo({ href = '#top', onClick }) {
  return (
    <a className="logo" href={href} onClick={onClick} aria-label="Next Data">
      <Cube />
      <span className="logo-words">
        <b className="logo-name">Next <em>Data</em></b>
        <small className="logo-by">by Next Finance</small>
      </span>
    </a>
  )
}
