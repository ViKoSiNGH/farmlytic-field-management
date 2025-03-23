
import { LucideProps } from 'lucide-react';

export const GardenIcon = (props: LucideProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
      <path d="M14.9 9.7a19.3 19.3 0 0 0-3.6 4.7c-.5.9-1.7.9-2.2 0a19 19 0 0 0-3.6-4.7c-.7-.6-.3-1.7.5-1.9 2.2-.5 4.4-1.1 4.8-2.7.2-.8 1.4-.8 1.6 0 .4 1.7 2.6 2.2 4.8 2.7.9.2 1.2 1.3.5 1.9Z" />
      <path d="M12 22v-3" />
      <path d="M10 22h4" />
      <path d="M12 15v4" />
    </svg>
  );
};

export const SeedlingIcon = (props: LucideProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 8c0-3.5 2.5-6 6-6s6 2.5 6 6-2.5 6-6 6c0 4-2 6-6 7 4-1 4-4 4-4" />
      <path d="M12 22v-8" />
    </svg>
  );
};
