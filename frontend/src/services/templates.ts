import api from './api';
import type { Exercise } from './exercises';

export interface TemplateExercise {
  id?: string;
  exerciseId: string;
  orderIndex: number;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  notes?: string;
  exercise?: Exercise;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: Array<TemplateExercise & { exercise: Exercise }>;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  exercises: Omit<TemplateExercise, 'id' | 'exercise'>[];
}

export const templateService = {
  // Get all templates
  async getTemplates(): Promise<Template[]> {
    const response = await api.get('/api/templates');
    return response.data.templates;
  },

  // Get single template
  async getTemplate(id: string): Promise<Template> {
    const response = await api.get(`/api/templates/${id}`);
    return response.data.template;
  },

  // Create template
  async createTemplate(data: CreateTemplateData): Promise<Template> {
    const response = await api.post('/api/templates', data);
    return response.data.template;
  },

  // Update template
  async updateTemplate(id: string, data: CreateTemplateData): Promise<Template> {
    const response = await api.put(`/api/templates/${id}`, data);
    return response.data.template;
  },

  // Delete template
  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/api/templates/${id}`);
  },
};
