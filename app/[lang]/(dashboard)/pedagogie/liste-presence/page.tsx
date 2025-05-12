import React from 'react'
import ListePresence from "./liste-presence"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function page() {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Liste de présence</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <ListePresence />
      </CardContent>
    </Card>
  )
}

export default page