import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface LandingCardProps {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: "gray" | "orange" | "blue" | "green" | "purple";
    className?: string;
    onClick?: () => void;
}

const colorStyles = {
    gray: {
        borderHover: "hover:border-gray-200",
        iconText: "text-gray-700",
        iconBg: "bg-gray-100",
        iconGroupBg: "group-hover:bg-gray-200",
        watermark: "text-gray-400", // Default Fallback, usually hidden or gray
        buttonText: "text-gray-900",
        title: "text-gray-900",
    },
    orange: {
        borderHover: "hover:border-orange-200",
        iconText: "text-orange-600",
        iconBg: "bg-orange-50",
        iconGroupBg: "group-hover:bg-orange-100",
        watermark: "text-orange-500",
        buttonText: "text-orange-600",
        title: "text-gray-900",
    },
    blue: {
        borderHover: "hover:border-blue-200",
        iconText: "text-blue-600",
        iconBg: "bg-blue-50",
        iconGroupBg: "group-hover:bg-blue-100",
        watermark: "text-blue-500",
        buttonText: "text-blue-600",
        title: "text-gray-900",
    },
    green: {
        borderHover: "hover:border-green-200",
        iconText: "text-green-600",
        iconBg: "bg-green-50",
        iconGroupBg: "group-hover:bg-green-100",
        watermark: "text-green-500",
        buttonText: "text-green-600",
        title: "text-gray-900",
    },
    purple: {
        borderHover: "hover:border-purple-200",
        iconText: "text-purple-600",
        iconBg: "bg-purple-50",
        iconGroupBg: "group-hover:bg-purple-100",
        watermark: "text-purple-500",
        buttonText: "text-purple-600",
        title: "text-gray-900",
    },
};

export default function LandingCard({
    href,
    title,
    description,
    icon: Icon,
    color,
    className = "",
    onClick,
}: LandingCardProps) {
    const styles = colorStyles[color];

    return (
        <Link href={href} className={`group ${className}`} onClick={onClick}>
            <div
                className={`h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col space-y-4 relative overflow-hidden ${styles.borderHover}`}
            >
                <div
                    className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color === "gray" ? "" : styles.watermark
                        }`}
                >
                    <Icon size={64} />
                </div>
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${styles.iconBg} ${styles.iconGroupBg}`}
                >
                    <Icon size={24} className={styles.iconText} />
                </div>
                <div>
                    <h2 className={`text-lg font-bold ${styles.title}`}>{title}</h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>
                <div
                    className={`mt-auto pt-4 flex items-center font-semibold text-sm ${styles.buttonText}`}
                >
                    View{" "}
                    <ArrowRight
                        size={16}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                </div>
            </div>
        </Link>
    );
}
