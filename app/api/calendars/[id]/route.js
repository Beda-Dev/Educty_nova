import { NextResponse } from "next/server";
import { calendarEvents } from "../data";

export async function DELETE(request, response) {
  try {
    const { id } = response.params;
    console.log(id, "ami id");

    const index = calendarEvents.findIndex((item) => item.id === parseInt(id));
    if (index !== -1) {
      // Remove the item from the array
      calendarEvents.splice(index, 1);
      return NextResponse.json({ data: { message: "Event deleted successfully" } });
    } else {
      return NextResponse.json({ data: { message: "Event not found" } }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ data: { message: error?.message || "Something went wrong" } }, { status: 500 });
  }
}

export async function PUT(request, response) {
  try {
    const { id } = response.params;
    const updatedEventData = await request.json();

    const index = calendarEvents.findIndex((item) => item.id === parseInt(id));
    if (index !== -1) {
      // Update the event data
      calendarEvents[index] = {
        ...calendarEvents[index],
        ...updatedEventData,
      };

      return NextResponse.json({ data: { message: "Event updated successfully", event: calendarEvents[index] } });
    } else {
      return NextResponse.json({ data: { message: "Event not found" } }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ data: { message: error?.message || "Something went wrong" } }, { status: 500 });
  }
}
