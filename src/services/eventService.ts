import { supabase } from '../lib/supabase';
import { Event, Expense, Participant } from '../types';

export const eventService = {
  async createEvent(name: string, description?: string): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        description,
        participants: [],
        expenses: []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEvent(id: string): Promise<Event> {
    console.log('Fetching event with ID:', id); // Debug log
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Supabase response:', { data, error }); // Debug log

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Event not found');
    }

    return data;
  },

  async addParticipant(eventId: string, name: string): Promise<Event> {
    const { data: event, error: getError } = await supabase
      .from('events')
      .select()
      .eq('id', eventId)
      .single();

    if (getError) throw getError;

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name
    };

    const { data, error } = await supabase
      .from('events')
      .update({
        participants: [...(event.participants || []), newParticipant]
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addExpense(eventId: string, expenseData: Omit<Expense, 'id' | 'created_at'>): Promise<Event> {
    const { data: event, error: getError } = await supabase
      .from('events')
      .select()
      .eq('id', eventId)
      .single();

    if (getError) throw getError;

    // Validar que el gasto tenga pagador y participantes
    if (!expenseData.payer) {
      throw new Error('Expense must have a payer');
    }

    if (!expenseData.participants || expenseData.participants.length === 0) {
      // Si no se especifican participantes, incluir a todos los participantes del evento
      expenseData.participants = event.participants.map((p: Participant) => p.id);
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...expenseData,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('events')
      .update({
        expenses: [...(event.expenses || []), newExpense]
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpense(eventId: string, expenseId: string, expenseData: Partial<Expense>): Promise<Event> {
    const { data: event, error: getError } = await supabase
      .from('events')
      .select()
      .eq('id', eventId)
      .single();

    if (getError) throw getError;
    
    // Asegurarse de que los campos payer y participants estén presentes
    if (expenseData.payer === undefined && expenseData.paid_by !== undefined) {
      expenseData.payer = expenseData.paid_by;
    }
    
    const updatedExpenses = (event.expenses || []).map((exp: Expense) =>
      exp.id === expenseId
        ? { ...exp, ...expenseData }
        : exp
    );

    const { data, error } = await supabase
      .from('events')
      .update({ expenses: updatedExpenses })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(eventId: string, expenseId: string): Promise<Event> {
    const { data: event, error: getError } = await supabase
      .from('events')
      .select()
      .eq('id', eventId)
      .single();

    if (getError) throw getError;
    
    const { data, error } = await supabase
      .from('events')
      .update({
        expenses: (event.expenses || []).filter((exp: Expense) => exp.id !== expenseId)
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteParticipant(eventId: string, participantId: string): Promise<Event> {
    const { data: event, error: getError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (getError) throw getError;
    if (!event) throw new Error('Event not found');

    const updatedParticipants = event.participants.filter(
      (p: any) => p.id !== participantId
    );

    const updatedExpenses = event.expenses.filter((expense: any) => {
      // Verificar si el participante no es el pagador
      const isNotPayer = expense.payer !== participantId;
      // Verificar si el participante no está en la lista de participantes (si existe)
      const isNotParticipant = !expense.participants || !expense.participants.includes(participantId);
      return isNotPayer && isNotParticipant;
    });

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({
        participants: updatedParticipants,
        expenses: updatedExpenses
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return updatedEvent;
  }
}; 