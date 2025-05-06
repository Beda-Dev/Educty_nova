interface FeeData {
  id: number;
  assignment_type: {
    label: string;
    slug: string;
    active: number;
    created_at: string;
    updated_at: string;
  };
  academic_year: {
    label: string;
    active: number;
    created_at: string;
    updated_at: string;
  };
  level: {
    label: string;
    slug: string;
    active: number;
    created_at: string;
    updated_at: string;
  };
  fee_type: {
    label: string;
    slug: string;
    active: number;
    created_at: string;
    updated_at: string;
  };
  label: string;
  amount: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export const feeData: FeeData[] = [
  {
    id: 1,
    assignment_type: {
      label: "affected",
      slug: "affected",
      active: 1,
      created_at: "2025-02-26T16:54:35.000000Z",
      updated_at: "2025-02-26T16:54:35.000000Z",
    },
    academic_year: {
      label:
        "Thu Oct 10 2024 00:00:00 GMT+0000 (heure moyenne de Greenwich) / Thu Jul 24 2025 00:00:00 GMT+0000 (heure moyenne de Greenwich)",
      active: 1,
      created_at: "2025-03-03T00:25:56.000000Z",
      updated_at: "2025-03-03T00:25:56.000000Z",
    },
    level: {
      label: "6e",
      slug: "6e",
      active: 1,
      created_at: "2025-03-03T10:09:28.000000Z",
      updated_at: "2025-03-03T10:09:28.000000Z",
    },
    fee_type: {
      label: "registration",
      slug: "registration",
      active: 1,
      created_at: "2025-03-04T11:08:57.000000Z",
      updated_at: "2025-03-04T12:15:47.000000Z",
    },
    label: "tarification",
    amount: "100000",
    active: 1,
    created_at: "2025-03-04T15:19:18.000000Z",
    updated_at: "2025-03-04T15:19:18.000000Z",
  },
  {
    id: 2,
    assignment_type: {
      label: "unaffected",
      slug: "unaffected",
      active: 1,
      created_at: "2025-02-27T10:30:22.000000Z",
      updated_at: "2025-02-27T10:30:22.000000Z",
    },
    academic_year: {
      label:
        "Thu Oct 10 2023 00:00:00 GMT+0000 (heure moyenne de Greenwich) / Thu Jul 24 2024 00:00:00 GMT+0000 (heure moyenne de Greenwich)",
      active: 1,
      created_at: "2025-03-03T01:15:30.000000Z",
      updated_at: "2025-03-03T01:15:30.000000Z",
    },
    level: {
      label: "5e",
      slug: "5e",
      active: 1,
      created_at: "2025-03-03T12:45:10.000000Z",
      updated_at: "2025-03-03T12:45:10.000000Z",
    },
    fee_type: {
      label: "tuition",
      slug: "tuition",
      active: 1,
      created_at: "2025-03-04T14:18:45.000000Z",
      updated_at: "2025-03-04T14:18:45.000000Z",
    },
    label: "frais de scolarité",
    amount: "150000",
    active: 1,
    created_at: "2025-03-04T16:25:00.000000Z",
    updated_at: "2025-03-04T16:25:00.000000Z",
  },
  {
    id: 3,
    assignment_type: {
      label: "partial",
      slug: "partial",
      active: 1,
      created_at: "2025-02-28T08:15:42.000000Z",
      updated_at: "2025-02-28T08:15:42.000000Z",
    },
    academic_year: {
      label:
        "Thu Oct 10 2022 00:00:00 GMT+0000 (heure moyenne de Greenwich) / Thu Jul 24 2023 00:00:00 GMT+0000 (heure moyenne de Greenwich)",
      active: 1,
      created_at: "2025-03-03T03:50:28.000000Z",
      updated_at: "2025-03-03T03:50:28.000000Z",
    },
    level: {
      label: "4e",
      slug: "4e",
      active: 1,
      created_at: "2025-03-03T14:00:00.000000Z",
      updated_at: "2025-03-03T14:00:00.000000Z",
    },
    fee_type: {
      label: "exam fees",
      slug: "exam_fees",
      active: 1,
      created_at: "2025-03-04T16:10:30.000000Z",
      updated_at: "2025-03-04T16:10:30.000000Z",
    },
    label: "frais d'examen",
    amount: "50000",
    active: 1,
    created_at: "2025-03-04T17:30:00.000000Z",
    updated_at: "2025-03-04T17:30:00.000000Z",
  },
];