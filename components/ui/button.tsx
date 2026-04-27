import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  className,
  variant = "primary",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "px-5 py-3 rounded-xl font-semibold transition",
        variant === "primary" &&
          "bg-[#FF3D00] text-white hover:opacity-90",
        variant === "secondary" &&
          "bg-[#f3f3f3] text-black hover:bg-[#eaeaea]",
        className
      )}
      {...props}
    />
  );
}
