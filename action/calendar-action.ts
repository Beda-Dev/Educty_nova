"use server";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/config/calendar.config";

import { revalidatePath } from "next/cache";

export const AddEvent = async (data: any) => {
  const response = await createEvent(data);
  revalidatePath("/calendar");
  return response;
};

export const deleteEventAction = async (id: any) => {
  const response = await deleteEvent(id);
  revalidatePath("/calendar");
  return response;
};

// update event
export const updateEventAction = async (id: any, data: any) => {
  const response = await updateEvent(id, data);
  revalidatePath("/calendar");
  return response;
};
