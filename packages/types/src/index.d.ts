export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
}
export interface CreateTodoDTO {
    title: string;
    description?: string;
}
export interface UpdateTodoDTO {
    completed: boolean;
}
//# sourceMappingURL=index.d.ts.map