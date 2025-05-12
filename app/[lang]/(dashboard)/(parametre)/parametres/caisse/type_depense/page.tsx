"use client";

import React from 'react';
import ExpenseTypePage from './expenseType_page';
import { ExpenseType} from "@/lib/interface";
import { useSchoolStore } from "@/store";


const TypeDepensePage = () => {
  const {expenseTypes} = useSchoolStore()

 
  return <ExpenseTypePage data={expenseTypes} />
};

export default TypeDepensePage;
