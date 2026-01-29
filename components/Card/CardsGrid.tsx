import LandingCard from "@/components/Card/LandingCard";
import { navigationCards } from "@/components/Data/NavigationData";

export default function CardsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navigationCards.map((card) => (
                <LandingCard
                    key={card.title}
                    {...card}
                />
            ))}
        </div>
    );
}
