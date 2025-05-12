import { Suspense } from "react"
import { CahierDeTexte } from "./cahier-de-texte"
import { CahierSkeleton } from "./cahier-skeleton"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <Card className="container mx-auto py-6 px-4 md:px-6">
        <CardHeader>
            <CardTitle>Cahier de texte</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
      <Suspense fallback={<CahierSkeleton />}>
        <CahierDeTexte />
      </Suspense>
        </CardContent>
    </Card>
  )
}
