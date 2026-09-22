/**
 * Image caption control: a picture with two lines of text beneath it.
 *
 * Drawn as a filled block rather than an outlined frame with scenery inside —
 * at 16px the interior detail reads as a plain "image" icon and the caption
 * lines disappear.
 */
function ImageCaption() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      role='img'
      className='richtext-h-4 richtext-w-4'
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.8'
    >
      <rect
        fill='currentColor'
        height='10'
        opacity='0.3'
        rx='1.6'
        stroke='none'
        width='18'
        x='3'
        y='3.5'
      />

      <rect height='10' rx='1.6' width='18' x='3' y='3.5' />

      <path d='M4 17.5h16' />

      <path d='M4 21h10' />
    </svg>
  );
}

export { ImageCaption };
