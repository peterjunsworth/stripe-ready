export default function TrashIcon({ color = "#667085" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="icon-trash"
        >
            <g clipPath="url(#clip0_2198_4499)">
                <path
                    d="M25.333 9.33333L24.1776 25.5234C24.0777 26.9187 22.9169 28 21.5171 28H10.4835C9.08376 28 7.92299 26.9187 7.82312 25.5234L6.66699 9.33333M13.333 14.6667V22.6667M18.667 14.6667V22.6667M20.0003 9.33333V5.33333C20.0003 4.59695 19.4037 4 18.667 4H13.333C12.5966 4 12.0003 4.59695 12.0003 5.33333V9.33333M5.33366 9.33333H26.6667"
                    stroke={color}
                    strokeWidth="2.1333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_2198_4499">
                    <rect width="32" height="32" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
