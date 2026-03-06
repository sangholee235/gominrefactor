import apiClient from './api';

export interface ChatMessage {
    id: number;
    content: string;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
    userId: number | null;
    provider: string;
    nickname?: string | null;
    userDeletedAt?: string | null;
    type?: 'TEXT' | 'SUSHI_SHARE' | 'SYSTEM';
    sushiId?: number;
    sushi?: {
        id: number;
        title: string;
        content: string;
    };
}

/**
 * 글로벌 채팅방의 최근 메시지 히스토리를 가져옵니다.
 */
export const getChatHistory = async (limit = 50): Promise<ChatMessage[]> => {
    const response = await apiClient.get<{ messages: any[] }>(
        `/chat/history?limit=${limit}`,
    );
    return response.data.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        deletedAt: msg.deletedAt,
        userId: msg.userId,
        provider: msg.user?.provider || '',
        nickname: msg.user?.nickname || null,
        userDeletedAt: msg.user?.deletedAt || null,
        type: msg.type,
        sushiId: msg.sushiId,
        sushi: msg.sushi,
    })).sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
};
