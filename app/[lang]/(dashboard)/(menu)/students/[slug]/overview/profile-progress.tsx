"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import React from 'react';

interface ProfileProgressProps {
  pourcentageRecouvrement: number;
  title?: string;
  className?: string;
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({
  pourcentageRecouvrement = 0,
  title = "Recouvrement des frais",
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader className="border-none mb-0">
        <CardTitle className="text-lg font-medium text-default-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col items-end gap-1">
          <Label className="text-sm font-medium text-default-700">
            {pourcentageRecouvrement}% Complet
          </Label>
          <Progress 
            value={pourcentageRecouvrement}  
            color={pourcentageRecouvrement >= 100 ? "success" : "primary"} 
            isStripe 
            className="w-full"  
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgress;