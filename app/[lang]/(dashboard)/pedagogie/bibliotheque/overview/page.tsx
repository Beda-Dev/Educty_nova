"use client"

import Link from "next/link"
import { Book, BookOpen, Users, Library, ArrowRight, LineChart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RecentEmprunts } from "./composant/recent-emprunts"
import { CategoriesChart } from "./composant/categories-chart"
import { Progress } from "@/components/ui/progress"

export default function Home() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bibliothèque</CardTitle>
        <CardDescription>
          Gestion de la bibliothèque scolaire
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full">
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Library className="h-6 w-6 text-skyblue" />
          <span className="text-lg font-semibold">BiblioGestion</span>
          <Badge color="skyblue" className="ml-2">Beta</Badge>
        </motion.div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { title: "Total des Livres", value: "1,248", change: "+24", icon: Book },
            { title: "Emprunts Actifs", value: "145", change: "+12", icon: BookOpen },
            { title: "Élèves Inscrits", value: "573", change: "+8", icon: Users },
            { title: "Enseignants Inscrits", value: "42", change: "+2", icon: Users }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">{stat.change}</span> ce mois
                  </p>
                </CardContent>
                <CardFooter className="p-0">
                  <Progress value={Math.min(100, 20 + index * 25)} className="h-1 w-full" />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Nouvel Emprunt", icon: BookOpen },
            { label: "Ajouter Livre", icon: Book },
            { label: "Nouvel Élève", icon: Users },
            { label: "Rapports", icon: LineChart }
          ].map((action) => (
            <Button 
              key={action.label}
              variant="outline" 
              className="h-24 flex-col gap-2 hover:bg-primary/5"
              asChild
            >
              <Link href="#">
                <action.icon className="h-6 w-6" />
                <span>{action.label}</span>
              </Link>
            </Button>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <motion.div whileHover={{ scale: 1.03 }}>Vue d'ensemble</motion.div>
              </TabsTrigger>
              <TabsTrigger value="categories">
                <motion.div whileHover={{ scale: 1.03 }}>Catégories</motion.div>
              </TabsTrigger>
              <TabsTrigger value="emprunts">
                <motion.div whileHover={{ scale: 1.03 }}>Emprunts</motion.div>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
              >
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Livres par Catégorie</CardTitle>
                    <CardDescription>
                      Répartition des livres par catégorie dans la bibliothèque
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <CategoriesChart />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Emprunts Récents</CardTitle>
                    <CardDescription>Les 5 derniers emprunts effectués</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentEmprunts />
                  </CardContent>
                  <CardFooter className="justify-end border-t p-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="#" className="flex items-center gap-1">
                        Voir tout <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Livres par Catégorie</CardTitle>
                    <CardDescription>
                      Détail du nombre de livres disponibles par catégorie
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <motion.div
                          key={category.id}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full bg-${category.color}-500`} />
                            <span>{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{category.count}</span>
                            <span className="text-xs text-muted-foreground">livres</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="emprunts" className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Tous les Emprunts Récents</CardTitle>
                    <CardDescription>
                      Liste des 10 derniers emprunts effectués
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentEmprunts extended />
                  </CardContent>
                  <CardFooter className="justify-end border-t p-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="#" className="flex items-center gap-1">
                        Exporter les données <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
      </CardContent>
    </Card>

  )
}

const categories = [
  { id: 1, name: "Littérature", count: 342, color: "blue" },
  { id: 2, name: "Sciences", count: 256, color: "green" },
  { id: 3, name: "Histoire", count: 189, color: "yellow" },
  { id: 4, name: "Mathématiques", count: 145, color: "red" },
  { id: 5, name: "Géographie", count: 98, color: "purple" },
  { id: 6, name: "Langues", count: 87, color: "pink" },
  { id: 7, name: "Arts", count: 76, color: "orange" },
  { id: 8, name: "Informatique", count: 55, color: "indigo" },
  
]