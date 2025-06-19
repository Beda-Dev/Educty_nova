"use client";

import { useState, useEffect } from "react";
import React from "react";
import LevelPage from "./level_page";
import { Level, Classe } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";

const LevelComponent = () => {
  const [data, setData] = useState<Level[]>([]);
  const { levels, classes, userOnline } = useSchoolStore();
  const permissionRequisVoir = ["voir niveau"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  function countClassesByLevel(
    levels: Level[],
    classes: Classe[]
  ): (Level & { class_count: number })[] {
    const levelsWithClassCount: (Level & { class_count: number })[] = [];

    for (const level of levels) {
      const classCount = classes.filter(
        (classe) => classe.level_id === level.id
      ).length;

      levelsWithClassCount.push({
        ...level,
        class_count: classCount,
      });
    }

    return levelsWithClassCount;
  }

  useEffect(() => {
    setData(countClassesByLevel(levels, classes));
  }, [levels, classes]);

  if (hasAdminAccessVoir === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return <LevelPage data={data} />;
};

export default LevelComponent;
