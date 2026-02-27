import { supabase } from './supabase';
import { Hotzone, Anchor } from '../types';

export const saveHotzone = async (hotzone: Hotzone) => {
  const { data, error } = await supabase
    .from('hotzones')
    .insert(hotzone)
    .select()
    .single();

  if (error) {
    console.error('Error saving hotzone:', error);
    throw error;
  }
  return data;
};

export const saveAnchor = async (anchor: Anchor) => {
  const { data, error } = await supabase
    .from('anchors')
    .insert(anchor)
    .select()
    .single();

  if (error) {
    console.error('Error saving anchor:', error);
    throw error;
  }
  return data;
};

export const fetchHotzones = async (audioId: string) => {
  const { data, error } = await supabase
    .from('hotzones')
    .select('*')
    .eq('audio_id', audioId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching hotzones:', error);
    throw error;
  }
  return data as Hotzone[];
};
