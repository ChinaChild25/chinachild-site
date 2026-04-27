import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "large" | "compact";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function buttonStyles({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2AF4]/30",
    size === "compact" && "px-4 py-2 text-sm",
    size === "default" && "px-6 py-3 text-sm sm:text-base",
    size === "large" && "px-7 py-4 text-base",
    variant === "primary" &&
      "bg-[#1A1A2E] text-white hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(26,26,46,0.18)]",
    variant === "secondary" &&
      "bg-white text-[#1A1A2E] ring-1 ring-[rgba(26,26,46,0.08)] hover:bg-[#f7f7f8]",
    variant === "ghost" && "bg-transparent text-[#1A1A2E] hover:bg-[#f3f4f6]",
    className,
  );
}

export default function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
