import { CardGrid, Modal, NavBar, Sidebar } from "../../components"
import { useState } from "react";
import { CardProps } from "../../types";

import styles from "./style.module.css"




export const HomePage: React.FC = () => {
    const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);

    const handleCardClick = (card: CardProps) => {
        setSelectedCard(card);
    };

    const handleCloseModal = () => {
        setSelectedCard(null);
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


    return (
        <>
            <NavBar toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} />
            <div className={`${styles.main} ${isSidebarOpen ? styles.open : ''}`}>
                <CardGrid onClick={handleCardClick} />
                {selectedCard && (
                    <Modal {...selectedCard} onClose={handleCloseModal} />
                )}
            </div>
        </>
    )
}
