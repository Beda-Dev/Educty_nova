"use client";

import React, { useEffect } from "react";
import CashRegisterSessionsPage from "./sessioncomponant";
import { useSchoolStore } from "@/store";
import { fetchCashRegisterSessions } from "@/store/schoolservice";
import {
  User,
  CashRegister,
  UserSingle,
  CashRegisterSession,
} from "@/lib/interface";

function SessionCaissePage() {
  const { cashRegisterSessions, setCashRegisterSessions } = useSchoolStore();

  useEffect(() => {
    const fetchsession = async () => {
      if (cashRegisterSessions.length > 0) {
        return;
      }
      const updatedSession = await fetchCashRegisterSessions();
      setCashRegisterSessions(updatedSession);
    };

    fetchsession();
  }, [setCashRegisterSessions]);

  return <CashRegisterSessionsPage data={cashRegisterSessions} />;
}

export default SessionCaissePage;
