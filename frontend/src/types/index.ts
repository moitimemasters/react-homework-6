export interface Category {
    id: string;
    name: string;
    description?: string;
    allowedGroups?: string[]; // Группы пользователей, имеющие доступ к категории
}


export interface CardProps {
    id: string;
    name: string;
    description?: string;
    categoryId: string;
    count: number;
    units: string;
    imageUrl?: string;
    price: number;
}

