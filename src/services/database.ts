import { supabase } from '../lib/supabase';
import { Event, User, Expense, Split } from '../types';

export const db = {
  // Eventos
  async createEvent(data: { name: string; description?: string }): Promise<Event> {
    const { data: event, error } = await supabase
      .from('events')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return event;
  },

  async getEvents(): Promise<Event[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return events;
  },

  // Usuarios por evento
  async addEventUser(eventId: string, name: string): Promise<User> {
    const { data: user, error } = await supabase
      .from('event_users')
      .insert([{ event_id: eventId, name }])
      .select()
      .single();
    
    if (error) throw error;
    return user;
  },

  async getEventUsers(eventId: string): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('event_users')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at');
    
    if (error) throw error;
    return users;
  },

  async deleteEventUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  },

  // Gastos
  async addExpense(data: {
    eventId: string;
    description: string;
    amount: number;
    paidBy: string;
    splits: Split[];
  }): Promise<Expense> {
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert([{
        event_id: data.eventId,
        description: data.description,
        amount: data.amount,
        paid_by: data.paidBy
      }])
      .select()
      .single();
    
    if (expenseError) throw expenseError;

    // Insertar las divisiones del gasto
    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(
        data.splits.map(split => ({
          expense_id: expense.id,
          user_id: split.userId,
          amount: split.amount
        }))
      );
    
    if (splitsError) throw splitsError;
    return expense;
  },

  async getEventExpenses(eventId: string): Promise<Expense[]> {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by_user:event_users!paid_by(name),
        splits:expense_splits(user_id, amount)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return expenses;
  }
}; 