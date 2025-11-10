import { BaseApiService } from './baseApiService';

interface Board {
  id: number;
  name: string;
  description?: string;
}

interface CreateBoardData {
  name: string;
  description?: string;
}

interface UpdateBoardData {
  name?: string;
  description?: string;
}

class BoardService extends BaseApiService {
  constructor() {
    super();
  }

  async getAllBoards(): Promise<Board[]> {
    try {
      return this.makeRequest('/boards');
    } catch (error) {
      console.error('Error getting all boards:', error);
      throw error;
    }
  }

  async getBoardById(id: number): Promise<Board> {
    try {
      return this.makeRequest(`/boards/${id}`);
    } catch (error) {
      console.error('Error getting board by ID:', error);
      throw error;
    }
  }

  async createBoard(boardData: CreateBoardData): Promise<Board> {
    try {
      return this.makeRequest('/boards', {
        method: 'POST',
        body: boardData,
      });
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  }

  async updateBoard(id: number, boardData: UpdateBoardData): Promise<Board> {
    try {
      return this.makeRequest(`/boards/${id}`, {
        method: 'PUT',
        body: boardData,
      });
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  }

  async deleteBoard(id: number): Promise<void> {
    try {
      await this.makeRequest(`/boards/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;
    }
  }
}

export const boardService = new BoardService();
export default boardService;
export type { Board, CreateBoardData, UpdateBoardData };