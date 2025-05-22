export interface ColumnProps {
  key: string;
  label: string;
}
export const columns: ColumnProps[] = [

  {
    key: "year",
    label: "année",
  },


 {
    key: "start",
    label: "date début",
  },
  {
    key: "end",
    label: "date fin",
  },
  {
    key:"active",
    label:"statut"
  }

];
