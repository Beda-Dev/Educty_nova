export enum EntryType {
    LESSON = "lesson",
    HOMEWORK = "homework",
    EXAM = "exam",
  }
  
  export interface Entry {
    id: string
    date: Date
    subject: string
    title: string
    content: string
    type: EntryType
    class: string
    academicYear: string
  }
  