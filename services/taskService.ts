import { supabase } from '@/supabase/client';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  duration: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

export async function getTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function getTasksForDate(date: string): Promise<Task[]> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('deadline', startOfDay.toISOString())
      .lt('deadline', endOfDay.toISOString())
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tasks for date:', error);
    return [];
  }
}

export async function addTask(input: CreateTaskInput): Promise<Task | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: authData.user.id,
          title: input.title,
          description: input.description || null,
          duration: input.duration,
          deadline: input.deadline,
          priority: input.priority,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
}

export async function updateTask(
  id: string,
  updates: Partial<CreateTaskInput> & { status?: string }
): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

export async function getStudyPlan(date: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching study plan:', error);
    return null;
  }
}

export async function saveStudyPlan(date: string, plan: any): Promise<any> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      throw new Error('User not authenticated');
    }

    const existingPlan = await getStudyPlan(date);

    if (existingPlan) {
      const { data, error } = await supabase
        .from('study_plans')
        .update({
          plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPlan.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('study_plans')
        .insert([
          {
            user_id: authData.user.id,
            date,
            plan,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving study plan:', error);
    return null;
  }
}
