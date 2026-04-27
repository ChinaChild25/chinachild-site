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
    "btn-pill",
    size === "compact" && "btn-pill-compact",
    size === "default" && "btn-pill-default",
    size === "large" && "btn-pill-large",
    variant === "primary" && "btn-ink",
    variant === "secondary" && "btn-white",
    variant === "ghost" && "btn-ghost",
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
